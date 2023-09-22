const express = require("express");
const { customerCollection } = require("../index");
const router = express.Router();
const { ObjectId } = require("mongodb");

router.post("/support-customers", async (req, res) => {
  const body = req.body;
  const result = await customerCollection.insertOne(body);
  res.send(result);
});

router.get("/support-customers", async (req, res) => {
  const result = await customerCollection.find({}).toArray();
  res.send(result);
});

router.get("/customer/:id", async (req, res) => {
  const id = req.params.id;

  // Check if the id is a valid ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).send("Invalid ObjectId format");
  }

  const query = { _id: new ObjectId(id) }; // Use ObjectId(id) without 'new'
  const result = await customerCollection.findOne(query);

  if (!result) {
    return res.status(404).send("Customer not found");
  }

  res.send(result);
});

router.delete('/customer/:id', async(req,res) => {

    const id = req.params.id;

  // Check if the id is a valid ObjectId format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).send("Invalid ObjectId format");
  }

  const query = { _id: new ObjectId(id) }; // Use ObjectId(id) without 'new'
  const result = await customerCollection.deleteOne(query);

  if (!result) {
    return res.status(404).send("Customer not found");
  }

  res.send(result);
})



module.exports = router;
