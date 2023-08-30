const express = require('express');
const { usersCollection, paymentCollection } = require('..');
const router = express.Router();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);


router.post("/create-payment-intent", async (req, res) => {
    try {
        // console.log("hit success");
        const { amount } = req.body;
        const amountConvert = parseInt(amount * 100); // convert needed for stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountConvert,
            currency: "usd",
            payment_method_types: ["card"],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send("An error occurred while creating the payment intent");
    }
});

// store transaction on the database 
router.post("/payments", async (req, res) => {
    try {
        //   console.log("hit success");
        const payment = req.body;
        // Find user and update balance
        const user = await usersCollection.findOne({ email: payment.userEmail });
        if (user) {
            if (!user.balance) {
                user.balance = 0;
            }
            user.balance += payment.amount;
            await usersCollection.updateOne({ email: payment.userEmail }, { $set: user });
        } else {
            console.log("User not found");
        }

        // Save payment transaction to the database
        const postResult = await paymentCollection.insertOne(payment);
        res.send(postResult);
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).send("An error occurred while processing the payment");
    }
});

module.exports = router;