const express = require("express");
// const { userAccountCollection } = require("..");
const { usersCollection, userAccountCollection } = require("../index");
const { ObjectId } = require("mongodb");
const router = express.Router();

/// store account --------------
router.post("/add-account", async (req, res) => {
  const account = req.body;
  const result = await userAccountCollection.insertOne(account);
  res.send(result);
});

// get all pending accounts ----------
router.get("/requested-accounts", async (req, res) => {
  const query = { status: "pending" }
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
          { firstName: { $regex: searchItem, $options: "i" } },
          { lastName: { $regex: searchItem, $options: "i" } },
          { email: { $regex: searchItem, $options: "i" } }
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
          { firstName: { $regex: searchItem, $options: "i" } },
          { lastName: { $regex: searchItem, $options: "i" } },
          { email: { $regex: searchItem, $options: "i" } }
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
router.get("/pending/:filterItem", async (req, res) => {
  const accountType = req.params.filterItem;
  if (!accountType) {
    return res.status(400).json({ error: "account type is required" })
  }
  const query = { account_type: accountType, status: "pending", };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result)
})
// pending approved filter ------------
router.get("/approved/:filterItem", async (req, res) => {
  const accountType = req.params.filterItem;
  if (!accountType) {
    return res.status(400).json({ error: "account type is required" })
  }
  const query = { account_type: accountType, status: "approved", };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result)
})


// get all approved accounts --------
router.get("/approved-accounts", async (req, res) => {
  const query = { status: "approved" };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
})



// ------------------------- account create/ update --------------------

// Function to generate a unique 10-digit account number
const generateRandomPassword = (length) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
};


const generateUniqueAccountNumber = () => {
  // Generate a random 6-digit number
  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  // Add a prefix to the random number (customize the prefix as needed)
  const accountNumber = `ACCT${randomNumber}`;

  return accountNumber;
};

// handle status 
router.patch("/status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.query.status;
    const accountInfo = await userAccountCollection.findOne({ _id: new ObjectId(id) });

    if (!accountInfo) {
      return res.status(404).send({ error: "Account not found" });
    }

    const nid_card_number = accountInfo.nid_card_number;
    const lastName = accountInfo.last_name;

    let updateDoc = {
      $set: {
        status: "active",
      },
    };

    if (status === "approved") {
      const existingUser = await usersCollection.findOne({ nid_card_number });

      if (!existingUser) {
        // User with the same NID card number does not exist, create a new user
        let username = lastName;
        let i = 1;
        while (true) {
          const potentialUsername = username + i;
          const userWithSameUsername = await usersCollection.findOne({ username: potentialUsername });
          if (!userWithSameUsername) {
            username = potentialUsername;
            break;
          }
          i++;
        }

        const accountNumber = await generateUniqueAccountNumber();
        const email = accountInfo.email;
        const phoneNumber = accountInfo.phone;

        // Generate a random password for the new user (at least 6 characters long)
        const password = generateRandomPassword(8);

        const newUser = {
          username: username,
          nid_card_number: nid_card_number,
          status: "active",
          password: password, // Include the generated password
          accounts: [
            {
              account_number: accountNumber,
              account_type: accountInfo.account_type,
              email: email,
              phoneNumber: phoneNumber,
            },
          ],
        };


        const insertResult = await usersCollection.insertOne(newUser);
        // update status in the userAccountCollection 
        let updateDocAccount = {
          $set: {
            status: "approved",
          },
        };
        await userAccountCollection.updateOne({ _id: new ObjectId(id) }, updateDocAccount);
        console.log("from 1st")
        res.status(201).send(insertResult);

      } else {
        // User with the same NID card number exists, update their account
        const accountNumber = await generateUniqueAccountNumber();
        const email = accountInfo.email;
        const phoneNumber = accountInfo.phone;



        // Create a new account object
        const newAccount = {
          account_number: accountNumber,
          account_type: accountInfo.account_type,
          email: email,
          phoneNumber: phoneNumber,
        };

        if (!Array.isArray(existingUser.accounts)) {
          existingUser.accounts = []; // Initialize accounts as an empty array if it's not an array
        }

        existingUser.accounts.push(newAccount); // Add the new account to the existing accounts

        updateDoc.$set.username = existingUser.username;
        updateDoc.$set.accounts = existingUser.accounts; // Update the accounts field in the updateDoc

        const query = { _id: existingUser._id };
        const result = await usersCollection.updateOne(query, updateDoc);

        // update status in the userAccountCollection 
        let updateDocAccount = {
          $set: {
            status: "approved",
          },
        };
        await userAccountCollection.updateOne({ _id: new ObjectId(id) }, updateDocAccount);
console.log("from 2nd")
        res.send(result);

      }
    } else {
      // Update the status in the userAccountCollection
      let updateDocAccount = {
        $set: {
          status: status,
        },
      };
      const query = { _id: new ObjectId(id) };
      const result = await userAccountCollection.updateOne(query, updateDocAccount);
      res.send(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
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
