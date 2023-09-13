const express = require('express');
const { careerCollection } = require('..');
const router = express.Router();


router.post('/addAJob',async(req,res)=>{
    const data=req.body
    console.log(data)
   const result=await careerCollection.insertOne(data)
   res.send(result)
})

 router.get('/careers',async(req,res)=>{
    const result= await careerCollection.find().toArray()
    res.send(result)

})



module.exports=router;