const express = require('express');
const router = express.Router();

router.get("/addUser",(req,res)=>{
    res.send("User Added Successfully")
})
router.post("/users", async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: "user already exits" });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
  });


module.exports = router;