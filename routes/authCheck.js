const express = require('express');
const router = express.Router();

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

module.exports = router;
