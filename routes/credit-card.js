const express = require("express");
const {
  userAccountCollection,
  creditCardCollection,
  usersCollection,
} = require("..");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/apply-credit-card", async (req, res) => {
  const creditCard = req.body;
  creditCard.status = "pending";
  const existingAccount = await userAccountCollection.findOne({
    accountNumber: creditCard.accountNumber,
    status: "approved",
    account_type: "Current Account",
    nid_card_number: creditCard.nidCardNumber,
  });
  const existingCreditCard = await creditCardCollection.findOne({
    accountNumber: creditCard.accountNumber,
  });
  if (!existingAccount) {
    return res.send({ message: "You Have No Current Account" });
  }
  if (existingCreditCard) {
    return res.send({
      message: "You Already Have A Credit Card For This Account",
    });
  }
  const result = await creditCardCollection.insertOne(creditCard);
  res.send(result);
});

// get all credit card request
router.get("/credit-card-requests", async (req, res) => {
  const result = await creditCardCollection.find().toArray();
  res.send(result);
});

router.patch("/card-status/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.query.status;
  const query = { _id: new ObjectId(id) };

  const updateDoc = {
    $set: {
      status: status,
    },
  };
  const result = await creditCardCollection.updateOne(query, updateDoc);
  res.send(result);
  if (status === "approved") {
    const requestedCard = await creditCardCollection.findOne(query);
    const existingUser = await usersCollection.findOne({
      username: requestedCard.username,
    });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const filter = {username:requestedCard.username}
    const newCreditCard = {
      title: requestedCard.title,
      firstName: requestedCard.firstName,
      lastName: requestedCard.lastName,
      accountNumber: requestedCard.accountNumber,
      status: "active",
    };
    if (!Array.isArray(existingUser.creditCards)) {
      existingUser.creditCards = [];
    }

    existingUser.creditCards.push(newCreditCard);
    const updateDoc = {
      $set: {
        creditCards: existingUser.creditCards,
      },
    };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result)
  }
});

// handle feedback ---------
router.put("/card-feedback/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const { feedback } = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      feedback: feedback,
    },
  };

  const result = await creditCardCollection.updateOne(query, updateDoc);
  res.send(result);
});

module.exports = router;
