const express = require("express");
const { userAccountCollection } = require("..");
const { ObjectId } = require("mongodb");
const router = express.Router();

/// store account --------------
router.post("/add-account", async (req, res) => {
  const account = req.body;
  const result = await userAccountCollection.insertOne(account);
  res.send(result);
});

// get all pending accounts ----------
router.get("/requested-accounts",async(req,res)=>{
  const query = {status:"pending"}
  const result = await userAccountCollection.find(query).toArray();
  res.send(result)
})

// Function to generate a unique 10-digit account number
async function generateUniqueAccountNumber() {
  while (true) {
    const randomThreeDigitNumber = Math.floor(Math.random() * 900) + 100; // Generates a random number between 100 and 999
    const accountNumber = `1003465000${randomThreeDigitNumber}`;

    const existingAccount = await userAccountCollection.findOne({ account_number: accountNumber });

    if (!existingAccount) {
      return accountNumber; // Return the unique account number
    }
  }
}

// handle status 
router.patch("/status/:id",async (req, res) => {
  const id = req.params.id;
  const status = req.query.status;
  const accountNumber = await generateUniqueAccountNumber();
  // console.log(status)
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: status,
      account_number:accountNumber
    },
  };

  const result = await userAccountCollection.updateOne(query, updateDoc);
  res.send(result);
});

router.get("/user-accounts", async (req, res) => {
  const { email } = req.query;
  const filter = { email: email };
  const result = await userAccountCollection.findOne(filter);
  res.send(result);
});


module.exports = router;
