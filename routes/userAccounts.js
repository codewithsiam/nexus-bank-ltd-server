const express = require("express");
const { userAccountCollection } = require("..");
const router = express.Router();

/// store account --------------
router.post("/add-account", async (req, res) => {
  const account = req.body;
  const result = await userAccountCollection.insertOne(account);
  res.send(result);
});

router.get("/userAccount",async(req,res)=>{
  const result = await userAccountCollection.find().toArray();
  res.send(result)
})

router.get("/user-accounts", async (req, res) => {
  const { email } = req.query;
  const filter = { email: email };
  const result = await userAccountCollection.findOne(filter);
  res.send(result);
});


module.exports = router;
