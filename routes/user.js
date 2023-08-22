const express = require('express');
const router = express.Router();
const { mongoClient, usersCollection } = require('../index');

// router.get("/addUser",(req,res)=>{
//     res.send("User Added Successfully")
// })
// router.post("/users", async (req, res) => {
//     const user = req.body;
//     const query = { email: user.email };
//     const existingUser = await userCollection.findOne(query);
//     if (existingUser) {
//       return res.send({ message: "user already exits" });
//     }
//     const result = await userCollection.insertOne(user);
//     res.send(result);
//   });
// users
router.get("/addUser", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
})
router.post("/users", async (req, res) => {
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