const express = require('express');
const router = express.Router();

const { mongoClient, loanCollection } = require('../index');

router.get('/loans', async (req, res) => { 
    try {
        const result = await loanCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/loans", async (req, res) => {
    const loanData = req.body;
    try {
        const result = await loanCollection.insertOne(loanData);
        res.status(201).json(result.ops[0]); // Send the inserted document back
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
