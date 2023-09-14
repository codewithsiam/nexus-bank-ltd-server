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

router.get('/news/:id',async(req,res)=>{
    console.log(req.params.id)
    const id=req.params.id;
    const query={_id: new ObjectId(id)};
    const result=await blogsCollection.findOne(query);
    res.send(result)
})
router.patch('/updateBlogs/:id',async(req,res)=>{
    const id=req.params.id;
    const data=req.body; 
    const options = { upsert: true }
    const query={_id:new ObjectId(id)}
    const updateDoc = {
        $set: {
         data
        },
      };
      const result = await blogsCollection.updateOne(query, updateDoc, options);
      res.send(result)
})














module.exports=router;