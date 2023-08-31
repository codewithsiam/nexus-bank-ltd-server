const express = require('express');
const router = express.Router();

const { userAccountCollection } = require('../index');

// .......get profile info..............
router.get("/profile", async (req, res) => {
    const result = await userAccountCollection.find().toArray();
    res.send(result);
    console.log(result)
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
