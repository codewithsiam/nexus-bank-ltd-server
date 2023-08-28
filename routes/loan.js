const express = require('express');
const router = express.Router();

const { mongoClient, loanCollection } = require('../index');

router.get('/loans', async (req, res) => { 
    try {
        console.log('loan');
        const result = await loanCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
