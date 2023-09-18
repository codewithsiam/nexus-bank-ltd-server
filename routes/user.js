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
      return res.status(404).json({ error: "Account is not found" });
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

//add card beneficiary
router.patch('/addcardbeneficiary',async (req,res)=>{
  const name=(req.query.userName)
  const data=req.body;
  const query={username:name}
  const options = { upsert: true };
  let updateDoc = {
    $set: {
      status: "active",
    },
  };
  const existingUser = await usersCollection.findOne({
    username: name,
  });
  const newBeneficiary = {
    name: data.name,
    account_number:data.account,
    phone:data.phone,
    email:data.email,
    id:data.id
  };
  if (!Array.isArray(existingUser.AddCardBeneficiary)) {
    existingUser.AddCardBeneficiary = [];
  }
  existingUser.AddCardBeneficiary.push(newBeneficiary);

  updateDoc.$set.AddCardBeneficiary = existingUser.AddCardBeneficiary;
  const query1 = { username: existingUser.username };
  const result = await usersCollection.updateOne(query1, updateDoc);
  res.send(result);
  
})

// handle beneficiary status 
router.patch("/beneficiary-status/:name", async(req,res)=>{
  const name = req.params.name;
  const status = req.query.status;
  const {username} = req.body;
  const existingUser = await usersCollection.findOne({username:username});
  if(existingUser){
    const beneficiary = existingUser.beneficiaryList.find(beneficiary=>beneficiary.username === name);
    if(beneficiary){
      beneficiary.status = status;
      const result = await usersCollection.updateOne({username:username},{$set:{beneficiaryList:existingUser.beneficiaryList}});
      res.send(result);
    }
  }
  else{
    res.status(500).json({message:"something wrong"})
  }
  // console.log(name,status,username);
})

//get Card Beneficiary
router.get('/CardBeneficiary',async(req,res)=>{
  const userName=req.query.useName;
  console.log(userName)
  const query={username:userName}
  const result=await usersCollection.findOne(query)
  res.send(result.AddCardBeneficiary)
})

//delete card beneficiary
router.delete('/deleteBeneficiary/:id',async(req,res)=>{
  const id=req.params.id;
  const username= req.query.username;
  const query={username:username}
  const updateDoc={ $pull: { AddCardBeneficiary: { id: id } }}
  const result=await usersCollection.updateOne(query,updateDoc);
  res.send(result)

})

// get beneficiary list -----------
router.get("/beneficiaryList/:username", async (req,res)=>{
  const username = req.params.username;
  console.log(username)
  const query = {username:username};
  const result = await usersCollection.findOne(query);
  if (result) {
    res.send(result.beneficiaryList);
  } else {
    res.status(404).send("User not found");
  }
})

module.exports = router;
