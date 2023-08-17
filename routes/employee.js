const express = require('express');
const router = express.Router();
router.get('/employees', async(req,res)=>{
    const result = await employeeCollection.find().toArray();
    res.send(result)
})