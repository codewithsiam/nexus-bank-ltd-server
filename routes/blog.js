const express = require('express');
const router = express.Router();
const {blogsCollection}=require('../index');
const { ObjectId } = require('bson');


router.post('/addBlogs',async(req,res)=>{
    const data=req.body
    console.log(data)
   const result=await blogsCollection.insertOne(data)
   res.send(result)
})

 router.get('/getBlogs',async(req,res)=>{
    const result= await blogsCollection.find().toArray()
    res.send(result)

})
router.delete("/deleteNews",async(req,res)=>{
console.log(req.body.id)
const id=req.body.id;
const query={_id:new ObjectId (id)}
const result=await blogsCollection.deleteOne(query)
res.send(result)

})















module.exports=router;