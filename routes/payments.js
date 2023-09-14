const express = require('express');
const cors = require('cors');
const { usersCollection, paymentCollection, userAccountCollection } = require('..');
const router = express.Router();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const { ObjectId } = require('mongodb');
const store_id = "siam647cd3e682e6d";
const store_passwd = "siam647cd3e682e6d@ssl";
const is_live = false;


router.get('/my-transactions', async (req, res) => {
    const email = req.query.email;
    console.log(email);
    const query = { userEmail: email }
    const result = await paymentCollection.find(query).toArray();
    res.send(result);
})

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

// ssl commerz 
// router.post("/ssl-payment", async (req, res) => {
//     const { transferToAccount, transferType, transferAmount, reason } = req.body;



//     // unique transaction id 
//     const tran_id = new ObjectId().toString();
// const totalAmount = parseFloat(transferAmount)

// const senderAccount = transferToAccount;
//     // ssl info
//     const data = {
//         total_amount: totalAmount,
//         currency: "BDT",
//         tran_id: tran_id,
//         transferType,
//         reason,
//         status: 'pending',
//         success_url: `https://nexus-cc1a9.web.app/payment-status/success/${tran_id}`,
//         fail_url: "https://nexus-cc1a9.web.app/payment-status/failed/no_transaction",
//         cancel_url: "https://nexus-cc1a9.web.app/payment-status/canceled/no_transaction",
//         ipn_url: "https://nexus-cc1a9.web.app/ipn",
//         shipping_method: "Courier",
//         product_name: "Computer.",
//         product_category: "Electronic",
//         product_profile: "general",
//         cus_name: "Customer Name",
//         cus_email: "customer@example.com",
//         cus_add1: "Dhaka",
//         cus_add2: "Dhaka",
//         cus_city: "Dhaka",
//         cus_state: "Dhaka",
//         cus_postcode: "1000",
//         cus_country: "Bangladesh",
//         cus_phone: "01711111111",
//         cus_fax: "01711111111",
//         ship_name: "Customer Name",
//         ship_add1: "Dhaka",
//         ship_add2: "Dhaka",
//         ship_city: "Dhaka",
//         ship_state: "Dhaka",
//         ship_postcode: 1000,
//         ship_country: "Bangladesh",
//     };



//     await paymentCollection.insertOne(data);

//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
//     sslcz.init(data).then(apiResponse => {

//         // Redirect the user to payment gateway
//         let GatewayPageURL = apiResponse.GatewayPageURL
//         res.send({ url: GatewayPageURL })
//         console.log('Redirecting to: ', GatewayPageURL)

//     });

//     const paymentConfirm = 
//     if (apiResponse.status == "SUCCESS") {
//         const updateDoc = {
//             $set: { status: "Completed" },
//         };

//         const filter = { tran_id: tran_id }
//         const result = paymentCollection.updateOne(filter, updateDoc);

//         const existingAccount = userAccountCollection.findOne({ accountNumber: senderAccount });


//         console.log("account" , existingAccount)

//         if (existingAccount) {
//             const currentBalance = existingAccount.balance;
//             console.log("current balance", currentBalance);
            
//             const transferAmount = totalAmount;
//             const newBalance = currentBalance + transferAmount;
//             console.log("new balance", newBalance);

//             userAccountCollection.updateOne(
//                 { accountNumber: senderAccount },
//                 { $set: { balance: parseFloat(newBalance) } }
//             );
//         } else {
//             console.error('User not found');
//         }


//     } else {
//         const updateDoc = {
//             $set: { status: "Failed" },
//         };

//         const filter = { tran_id: tran_id }
//         const result = paymentCollection.updateOne(filter, updateDoc);
//     }
// });


router.post('/payment-status/:tranId', async (req, res) => {
    const tranId = req.params.tranId;

    console.log('Successfully transfered: ', tranId)


    res.redirect(
        `https://nexus-cc1a9.web.app/payment-status/success/${tranId}`
    )

});

module.exports = router;