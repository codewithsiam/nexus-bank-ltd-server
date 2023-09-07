const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const { mongoClient, employeeCollection, usersCollection, userAccountCollection } = require('../index');

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

//login user
router.post('/login', async (req, res) => {
  console.log(req.query);

  try {
    const { password, username } = req.query;
    // console.log(username);
    const pass = `${username}${password}`
    console.log(pass);
    let result;
    result = await usersCollection.findOne({ username: username });
    if (result) {
      bcrypt.compare(password, result.password, function (err, response) {
        if (err) {
          console.log(err);
          res.status(200).json({
            status: false,
            message: err.message,
          });
        }
        if (response) {
          const token = jwt.sign(
            { username: result._id },
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
        message: "Invalid username",
      });
    }
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
});

// account number to email getting api 
router.get('/account-to-email', async (req, res) => {
  try {
    const { accountNumber } = req.query;

    // Assuming userAccountCollection is a MongoDB collection, use findOne to find a user by accountNumber
    const user = await userAccountCollection.findOne({ accountNumber });

    if (user) {
      const email = user.email;
     return res.status(200).json({success: true, message: "Email find successfully"});
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
});


module.exports = router;
