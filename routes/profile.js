const express = require('express');
const router = express.Router();

const { userAccountCollection } = require('../index');

// .........get all account............
router.get("/approved-account", async (req, res) => {
  const approvedAccounts = await userAccountCollection.find({ status: "approved" }).toArray();
  res.send(approvedAccounts);
  console.log(approvedAccounts);
})

router.patch("/update-Profile/:email", async (req, res) => {
  const email = req.params.email;
  const body = req.body;
console.log(email)
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      nationality: body.nationality,
      // birthday: body.birthday,
      gender: body.gender,
      profession: body.profession,
      number: body.number,
      description: body.description,
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.send(result);
});

module.exports = router;
