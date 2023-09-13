const express = require('express');
const { customerCollection } = require('../index');
const router = express.Router();

router.post('/support-customers', async (req, res) => {
    const body = req.body;
    const result = await customerCollection.insertOne(body);
    res.send(result)
})

router.get('/support-customers', async (req, res) => {
    const result = await customerCollection.find({}).toArray()
    res.send(result)
})


module.exports = router