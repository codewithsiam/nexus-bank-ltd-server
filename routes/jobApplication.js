const express = require('express');
const { jobApplicationCollection } = require('..');
const router = express.Router();



 router.get('/appliedJobs',async(req,res)=>{
    const result= await jobApplicationCollection.find().toArray()
    res.send(result)

})
router.post('/appliedJobs',async(req,res)=>{
    const data=req.body
    console.log(data)
   const result=await jobApplicationCollection.insertOne(data)
   res.send(result)
})


module.exports=router;