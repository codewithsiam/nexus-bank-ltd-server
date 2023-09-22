const express = require("express");
const router = express.Router();
const { blogsCollection } = require("../index");
const { ObjectId } = require('mongodb');

router.post("/addBlogs", async (req, res) => {
  const data = req.body;
  console.log(data);
  const result = await blogsCollection.insertOne(data);
  res.send(result);
});

router.get("/getBlogs", async (req, res) => {
  const result = await blogsCollection.find().toArray();
  res.send(result);
});
router.delete("/deleteNews", async (req, res) => {
  console.log(req.body.id);
  const id = req.body.id;
  const query = { _id: new ObjectId(id) };
  const result = await blogsCollection.deleteOne(query);
  res.send(result);
});

router.delete("/deleteNews", async (req, res) => {
  console.log(req.body.id)
  const id = req.body.id;
  const query = { _id: new ObjectId(id) }
  const result = await blogsCollection.deleteOne(query)
  res.send(result)

})

router.get('/news', async (req, res) => {
  try {
    const id = req.query.id;
    console.log("id", req.query.id);

    const query = { _id: new ObjectId(id) };
    const result = await blogsCollection.findOne(query);

    if (result) {
      res.send(result);
    } else {
      res.status(404).send({ message: 'Not found' });
    }
  } catch (error) {
    console.error("Error while fetching data:", error);
    res.status(500).send({ message: 'Internal server error' });
  }
});


router.patch('/updateBlogs/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const options = { upsert: true }
  const query = { _id: new ObjectId(id) }
  const updateDoc = {
    $set: {
      data
    },
  };
  const result = await blogsCollection.updateOne(query, updateDoc, options);
  res.send(result)
})














module.exports = router;
