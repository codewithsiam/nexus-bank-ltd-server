const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { sendEmail } = require('../Modules/emailSend');

const { mongoClient, userAccountCollection, paymentCollection } = require('../index');

router.put('/money-transfer', async (req, res) => {
    try {

        const data = req.body;
        const username = req.query.username;
        console.log('Request Data:', username);

        // Sender account data
        const senderFilter = { accountNumber: data?.transferFromAccount };
        const senderAccount = await userAccountCollection.findOne(senderFilter);
        // console.log('Sender Account:', senderAccount);

        // own account validate 
        if (data.transferToAccount == data?.transferFromAccount) {
            res.send({ success: false, message: 'Sender account and receiver account are same' });
        }

        if (!senderAccount) {
            return res.send({ message: 'Sender account not found' });
        }
        // balance validation 
        if (senderAccount.balance <= 0 || senderAccount.balance < data.transferAmount) {
            return res.send({ message: 'Unsufficient Balance' });
        }

        // Receiver account data
        const receiverFilter = { accountNumber: data?.transferToAccount };
        const receiverAccount = await userAccountCollection.findOne(receiverFilter);
        // console.log('Receiver Account:', receiverAccount);
        if (!receiverAccount) {
            return res.send({ message: 'Receiver account not found' });
        }



        // sender balance reduce 
        const senderNewBalance = parseFloat(senderAccount.balance) - parseFloat(data.transferAmount);
        await userAccountCollection.updateOne(senderFilter, { $set: { balance: senderNewBalance } });



        // add balance to receiverAccount 
        const receiverNewBalance = parseFloat(receiverAccount.balance) + parseFloat(data.transferAmount);
        await userAccountCollection.updateOne(receiverFilter, { $set: { balance: receiverNewBalance } });

        // store in database 
        const transaction = {
            time: new Date().toISOString(),
            senderAccountNumber: senderAccount.accountNumber,
            receiverAccountNumber: receiverAccount.accountNumber,
            transferAmount: parseFloat(data.transferAmount),
            transactionType: data.transactionType,
            reason: data?.reason,
            username: username,
        };

        const transactionData = await paymentCollection.insertOne(transaction);
        //    using inserted id as a transaction id 
        const transactionId = transactionData.insertedId.toString();



        // send email to sender and receiver 
        const receiverSubject = `You Received Money From ACCOUNT: ${senderAccount.accountNumber} `;
        const senderSubject = `You Send Money To ACCOUNT: ${receiverAccount.accountNumber} `;
        const senderHtmlText = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Money Sent</title>
</head>
<body>
    <h1>Money Sent Successfully</h1>
    <p>Hello ${senderAccount.first_name + " " + senderAccount.last_name},</p>
    <p>You have successfully sent money to ${receiverAccount.first_name + " " + receiverAccount.last_name} with the following details:</p>
    
    <ul>
        <li>Amount: ${parseFloat(data.transferAmount)}</li>
        <li>Date: ${transaction.time} </li>
        <li>Transaction ID: ${transactionId}</li>
        <li>Receiver Account:  ${receiverAccount.accountNumber}</li>
        
    </ul>

    <p>Thank you for using our services.</p>

    <p>Best regards,</p>
    <p>Nexus Bank LTD</p>
</body>
</html>

        `
        const receiverHtmlText = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Money Received</title>
</head>
<body>
    <h1>Money Received</h1>
    <p>Hello ${receiverAccount.first_name + receiverAccount.last_name},</p>
    <p>You have received a payment from ${senderAccount.first_name + " " + senderAccount.last_name} with the following details:</p>
    
    <ul>
    <li>Amount: ${parseFloat(data.transferAmount)}</li>
    <li>Date: ${transaction.time} </li>
    <li>Transaction ID: ${transactionId}</li>
    <li>Sender Account Number: ${senderAccount.accountNumber}</li>
    </ul>

    <p>Thank you for using our services.</p>

    <p>Best regards,</p>
    <p>Nexus Bank LTD</p>
</body>
</html>

        `
        sendEmail(senderAccount.email, senderSubject, senderHtmlText)
        sendEmail(receiverAccount.email, receiverSubject, receiverHtmlText)



        res.send({ success: true, message: 'Money transfer successful', transactionId });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/money-transfer', async (req, res) => {
    const result = await paymentCollection.find({}).toArray();
    res.send(result)
})

router.get('/cash-in', async (req, res) => {
    const username = req.query.username;

    const filter = {
        username: username,
        transactionType: "cash in"
    };

    const result = await paymentCollection.find(filter).toArray();
    res.send(result);
});
router.get('/transfer-history', async (req, res) => {
    const username = req.query.username;

    const filter = {
        username: username,
        transactionType: "transfer"
    };

    const result = await paymentCollection.find(filter).toArray();
    res.send(result);
});

router.get('/transfer-history-info', async (req, res) => {
    const username = req.query.username;

    const pipeline = [
        {
            $match: {
                username: username,
                transactionType: "transfer"
            }
        },
        {
            $group: {
                _id: null,
                totalTransferAmount: { $sum: "$transferAmount" }
            }
        }
    ];

    const result = await paymentCollection.aggregate(pipeline).toArray();
    if (result.length > 0) {
        res.send({ totalTransferAmount: result[0].totalTransferAmount });
    } else {
        res.send({ totalTransferAmount: 0 }); 
    }
});


router.get('/cash-in-history-info', async (req, res) => {
    const username = req.query.username;
    console.log(username);
    const pipeline = [
        {
            $match: {
                username: username,
                transactionType: "cash in"
            }
        },
        {
            $group: {
                _id: null,
                amount: { $sum: "$amount" }
            }
        }
    ];

    const result = await paymentCollection.aggregate(pipeline).toArray();
    if (result.length > 0) {
        res.send({ amount: result[0].amount });
    } else {
        res.send({ amount: 0 }); 
    }
});



module.exports = router;
