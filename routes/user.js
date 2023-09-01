const express = require("express");
const router = express.Router();
const { mongoClient, usersCollection } = require("../index");

// users
router.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

router.post("/addUser", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exits" });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});



module.exports = router;
