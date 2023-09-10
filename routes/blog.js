const express = require('express');
const router = express.Router();
const {blogsCollection}=require('../index')


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














module.exports=router;