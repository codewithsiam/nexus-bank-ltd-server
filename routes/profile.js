const express = require('express');
const router = express.Router();

const { userAccountCollection } = require('../index');

// .........get all account............
router.get("/approved-account", async (req, res) => {
  const approvedAccounts = await userAccountCollection.find({ status: "approved" }).toArray();
  res.send(approvedAccounts);
  console.log(approvedAccounts);
});


router.patch("/update_Profile/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        price: body.price,
        available_quantity: body.available_quantity,
        description: body.description,
      },
    };
    const result = await userAccountCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  });


module.exports = router;
