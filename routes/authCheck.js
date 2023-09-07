const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const { mongoClient, employeeCollection, usersCollection } = require('../index');

router.get('/auth-check', async (req, res) => {
    const email = req.query.email;
    // console.log(email);

    try {
        const firstCheck = await usersCollection.find({ email: email }).toArray();

        if (firstCheck.length > 0) { 
            const secondCheck = await employeeCollection.findOne({ primaryEmail: email });

            if (secondCheck) { 
                const designation = secondCheck.designation;
                res.send(designation); 
            } else {
                res.status(404).send("Employee not found");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/login', async (req, res) => {
    try {
        const { password, email, role } = req.body;
        let result;
        result = await user.findOne({ email: email });
        if (result) {
          bcrypt.compare(password, result.password, function (err, response) { 
            if (err) {
              res.status(200).json({
                status: false,
                message: err.message,
              });
            }
            if (response) {
              const token = jwt.sign(
                { email: result._id },
                process.env.WEB_TOKEN_SECRET,
                { expiresIn: "1d" }
              );
              res.status(200).json({
                status: true,
                message: "login successful",
                result: result,
                token: token,
              });
            } else {
              // response is OutgoingMessage object that server response http request
              res.json({
                success: false,
                message: "passwords do not match",
              });
            }
          });
        } else {
          res.status(200).json({
            status: false,
            message: "Invalid Email",
          });
        }
      } catch (error) {
        res.status(200).json({
          status: false,
          message: error.message,
        });
      }
});

module.exports = router;
