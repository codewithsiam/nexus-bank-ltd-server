const express = require('express');
const router = express.Router();

const { mongoClient, userAccountCollection, paymentCollection } = require('../index');

router.put('/money-transfer', async (req, res) => {
    try {
        const data = req.body;
        console.log("sdfsdf",data);
        console.log('Request Data:', data);

        // Sender account data
        const senderFilter = { account_number: data?.senderAccountNumber };
        const senderAccount = await userAccountCollection.findOne(senderFilter);
        console.log('Sender Account:', senderAccount);

        if (!senderAccount) {
            return res.status(404).send({ message: 'Sender account not found' });
        }
        // balance validation 
        if(senderAccount.balance <= 0 || senderAccount.balance < data.transferAmount) {
            return res.status(404).send({ message: 'Unsufficient Balance' });
        }
        const senderNewBalance = parseFloat(senderAccount.balance) - parseFloat(data.transferAmount);
        await userAccountCollection.updateOne(senderFilter, { $set: { balance: senderNewBalance } });

        // Receiver account data
        const receiverFilter = { account_number: data?.receiverAccountNumber };
        const receiverAccount = await userAccountCollection.findOne(receiverFilter);

        if (!receiverAccount) {
            return res.status(404).send({ message: 'Receiver account not found' });
        }
        const receiverNewBalance = parseFloat(receiverAccount.balance) + parseFloat(data.transferAmount);
        await userAccountCollection.updateOne(receiverFilter, { $set: { balance: receiverNewBalance } });
        const transaction = {
            time: new Date(),
            receiverName: data.receiverName,
            accountType: data.accountType,
            userEmail: data.userEmail,
            senderAccountNumber: senderAccount.account_number,
            receiverAccountNumber: receiverAccount.account_number,
            transferAmount: parseFloat(data.transferAmount),
            transactionType: "transfer",
        };

        await paymentCollection.insertOne(transaction);

        res.send({ message: 'Money transfer successful' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
