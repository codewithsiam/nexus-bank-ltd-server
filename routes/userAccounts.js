const express = require("express");
const { userAccountCollection } = require("..");
const router = express.Router();

router.post("/add-account", async (req, res) => {
  const account = req.body;
  const result = await userAccountCollection.insertOne(account);
  res.send(result);
});

router.get("/user-accounts", async (req, res) => {
  const { email } = req.query;
  const filter = { email: email };
  const result = await userAccountCollection.findOne(filter);
  res.send(result);
});


module.exports = router;
