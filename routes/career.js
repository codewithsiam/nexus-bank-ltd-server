const express = require('express');
const { careerCollection } = require('..');
const { ObjectId } = require('mongodb');
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

router.delete("/careers/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await careerCollection.deleteOne(query);
    res.send(result);
  });



module.exports=router;