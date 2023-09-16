const express = require("express");
const { ObjectId } = require("mongodb");
const { customerCollection } = require("../index");
const router = express.Router();

router.post("/support-customers", async (req, res) => {
  const body = req.body;
  const result = await customerCollection.insertOne(body);
  res.send(result);
});

router.get("/support-customers", async (req, res) => {
  const result = await customerCollection.find({}).toArray();
  res.send(result);
});

router.get("/support-customer/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query = { _id: new ObjectId(id) };
  const result = await customerCollection.findOne(query)
  res.send(result)
});

module.exports = router;
