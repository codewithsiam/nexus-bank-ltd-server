const express = require("express");
const router = express.Router();
const {
  mongoClient,
  usersCollection,
  userAccountCollection,
} = require("../index");
const { ObjectId } = require("mongodb");


// users
router.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

router.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.findOne(query);
  res.send(result);
});

router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
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

// handle banifinary ---------
router.patch("/add-beneficiary", async (req, res) => {
  let updateDoc = {
    $set: {
      status: "active",
    },
  };
  const { username, account_number, selfUserName } = req.body;
  console.log(account_number)

  try {
    // Check if the current account with the provided account number exists
    const currentAccount = await userAccountCollection.findOne({
      account_type: "Current Account",
      accountNumber: account_number,
    });

    if (!currentAccount) {
      // If the account doesn't exist, send an error response
      return res.status(404).json({ error: "Account not found" });
    }

    const existingUser = await usersCollection.findOne({
      username: selfUserName,
    });
    // if (!existingUser) {
    //   return res.status(404).json({ error: "User not found" });
    // }
    const newBeneficiary = {
      username: username,
      account_number: account_number,
      status: "active",
    };

    if (!Array.isArray(existingUser.beneficiaryList)) {
      existingUser.beneficiaryList = [];
    }

    existingUser.beneficiaryList.push(newBeneficiary);

    updateDoc.$set.beneficiaryList = existingUser.beneficiaryList;

    const query = { username: existingUser.username };
    const result = await usersCollection.updateOne(query, updateDoc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
