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
});

// search by name , email in pending account
router.get("/pending-account/:searchItem", async (req, res) => {
  const searchItem = req.params.searchItem;
  if (!searchItem) {
    return res.status(400).json({ error: "name parameter is required" });
  }

  const query = {
    $and: [
      {
        $or: [
          { firstName: { $regex: searchItem, $options: "i" }},
          { lastName: { $regex: searchItem, $options: "i" }},
          { email: { $regex: searchItem, $options: "i" }}
        ],
      },
      { status: "pending" } // Add the condition for pending accounts
    ]
  };

  try {
    const result = await userAccountCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching approved accounts:", error);
    res.status(500).json({ error: "An error occurred while fetching approved accounts" });
  }
});
// search by name , email in approved account
router.get("/approved-account/:searchItem", async (req, res) => {
  const searchItem = req.params.searchItem;
  if (!searchItem) {
    return res.status(400).json({ error: "name parameter is required" });
  }

  const query = {
    $and: [
      {
        $or: [
          { firstName: { $regex: searchItem, $options: "i" }},
          { lastName: { $regex: searchItem, $options: "i" }},
          { email: { $regex: searchItem, $options: "i" }}
        ],
      },
      { status: "approved" } // Add the condition for pending accounts
    ]
  };

  try {
    const result = await userAccountCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching approved accounts:", error);
    res.status(500).json({ error: "An error occurred while fetching approved accounts" });
  }
});

// pending account filter ------------
router.get("/pending/:filterItem",async(req,res)=>{
  const accountType = req.params.filterItem;
  if(!accountType){
    return res.status(400).json({error:"account type is required"})
  }
  const query = {account_type:accountType,  status: "pending", };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result)
})
// pending approved filter ------------
router.get("/approved/:filterItem",async(req,res)=>{
  const accountType = req.params.filterItem;
  if(!accountType){
    return res.status(400).json({error:"account type is required"})
  }
  const query = {account_type:accountType,  status: "approved", };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result)
})


// get all approved accounts --------
router.get("/approved-accounts", async(req,res)=>{
  const query = {status:"approved"};
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
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
router.patch("/status/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.query.status;
  let updateDoc = {
    $set: {
      status: status,
    },
  };

  if (status === "approved") {
    const accountNumber = await generateUniqueAccountNumber();
    updateDoc.$set.account_number = accountNumber;
  }

  const query = { _id: new ObjectId(id) };

  const result = await userAccountCollection.updateOne(query, updateDoc);
  res.send(result);
});

// handle feedback ---------
router.put("/feedback/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id)
  const { feedback } = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      feedback: feedback,
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
