const express = require("express");
const bcrypt = require("bcrypt");

// const { userAccountCollection } = require("..");
const {
  usersCollection,
  userAccountCollection,
  depositPackage,
} = require("../index");
const { ObjectId } = require("mongodb");
const { sendEmail } = require("../Modules/emailSend");
const router = express.Router();

/// store account --------------
router.post("/add-account", async (req, res) => {
  const account = req.body;
  const result = await userAccountCollection.insertOne(account);
  res.send(result);
});

// get all pending accounts ----------
router.get("/requested-accounts", async (req, res) => {
  const query = { status: "pending" };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
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
          { email: { $regex: searchItem, $options: "i" } },
        ],
      },
      { status: "pending" }, // Add the condition for pending accounts
    ],
  };

  try {
    const result = await userAccountCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching approved accounts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching approved accounts" });
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
          { email: { $regex: searchItem, $options: "i" } },
        ],
      },
      { status: "approved" }, // Add the condition for pending accounts
    ],
  };

  try {
    const result = await userAccountCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching approved accounts:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching approved accounts" });
  }
});

// pending account filter ------------
router.get("/pending/:filterItem", async (req, res) => {
  const accountType = req.params.filterItem;
  if (!accountType) {
    return res.status(400).json({ error: "account type is required" });
  }
  const query = { account_type: accountType, status: "pending" };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
});
// pending approved filter ------------
router.get("/approved/:filterItem", async (req, res) => {
  const accountType = req.params.filterItem;
  if (!accountType) {
    return res.status(400).json({ error: "account type is required" });
  }
  const query = { account_type: accountType, status: "approved" };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
});

// get all approved accounts --------
router.get("/approved-accounts", async (req, res) => {
  const query = { status: "approved" };
  const result = await userAccountCollection.find(query).toArray();
  res.send(result);
});

router.get('/current-user-account', async (req, res) => {
  const filter = 'Current Account'
  const result = await userAccountCollection.find({ account_type: filter }).toArray()
  res.send(result)
})

router.get('/deposit-user-account', async (req, res) => {
  const filter = 'Deposit Account';
  const result = await userAccountCollection.find({ account_type: filter }).toArray()
  res.send(result)
})

router.get('/saving-user-account', async (req, res) => {
  const filter = 'Saving Account';
  const result = await userAccountCollection.find({ account_type: filter }).toArray()
  res.send(result)
})

router.get('/student-user-account', async (req, res) => {
  const filter = 'Student Account';
  const result = await userAccountCollection.find({ account_type: filter }).toArray()
  res.send(result)
})

// ----------------------------------------------------------------------//
// ------------------------- account create/ update --------------------//
// ----------------------------------------------------------------------//

// Function to generate a unique 10-digit account number
const generateRandomPassword = (length) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
  const accountNumber = `NBL${randomNumber}`;

  return accountNumber;
};

// handle status
router.patch("/status/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.query.status;
    const accountInfo = await userAccountCollection.findOne({
      _id: new ObjectId(id),
    });

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
      const accountNumber = await generateUniqueAccountNumber();

      if (!existingUser) {
        // User with the same NID card number does not exist, create a new user
        let username = lastName.toLocaleLowerCase();
        let i = 1;
        while (true) {
          const potentialUsername = username + i;
          const userWithSameUsername = await usersCollection.findOne({
            username: potentialUsername,
          });
          if (!userWithSameUsername) {
            username = potentialUsername;
            break;
          }
          i++;
        }

        const email = accountInfo.email;
        const phoneNumber = accountInfo.phone;

        // Generate a random password for the new user (at least 6 characters long)
        const password = generateRandomPassword(8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
          username: username,
          nid_card_number: nid_card_number,
          status: "active",
          password: hashedPassword, // Include the generated password

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
            balance: 0,
            accountNumber,
          },
        };
        await userAccountCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDocAccount
        );

        const subject = `Your Account is Approved (${accountInfo.account_type}) - Here are Your Login Credentials`;
        const htmlText = `
       
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Service</title>
  <style>
    /* Add your custom CSS styles here, e.g., for styling the email content */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #333;
    }
    .username {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Our Service</h1>
    <p>Thank you for creating an account with us. Your account Number is: ${accountNumber} <br> Here are your login credentials:</p>
    <p><span class="username">Username:</span> ${username}</p>
    <p><span class="username">Password:</span> ${password}</p>
    <p>Please keep your login information secure and do not share it with others. You can now use your username and password to access our services.</p>
    <p>If you have any questions or need assistance, please don't hesitate to <a href="mailto:nexusbltd@gmail.com">contact our support team</a>.</p>
    <p>Best regards,<br>Your Service Team<br>Nexus Bank LTD.</p>
  </div>
</body>
</html>

        `;

        await sendEmail(email, subject, htmlText);

        res.status(201).send(insertResult);
      } else {

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
          existingUser.accounts = [];
        }

        existingUser.accounts.push(newAccount);

        updateDoc.$set.accounts = existingUser.accounts;

        const query = { _id: existingUser._id };
        const result = await usersCollection.updateOne(query, updateDoc);

        // update status in the userAccountCollection
        let updateDocAccount = {
          $set: {
            status: "approved",
            balance: 0,
            accountNumber
          },
        };
        await userAccountCollection.updateOne(
          { _id: new ObjectId(id) },
          updateDocAccount
        );

        const subject = `Approved Your Account: ${accountInfo.account_type}`;
        const htmlText = `
        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Account is Approved</title>
  <style>
    /* Add your custom CSS styles here, e.g., for styling the email content */
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #333;
    }
    .account-number {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Account is Approved</h1>
    <p>Dear ${username},</p>
    <p>We are pleased to inform you that your account with ${accountInfo.account_type} has been approved and is now active. You can log in to your account using your account number:</p>
    <p><span class="account-number">Account Number:</span> ${accountNumber}</p>
    <p>If you have any questions or need assistance, please don't hesitate to <a href="mailto:nexusbltd@gmail.com">contact our support team</a>.</p>
    <p>Thank you for choosing [Your Service Name]. We look forward to serving you.</p>
    <p>Best regards,<br>Your Service Team</p>
  </div>
</body>
</html>

        `;
        await sendEmail(email, subject, htmlText);

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
      const result = await userAccountCollection.updateOne(
        query,
        updateDocAccount
      );
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
  console.log(id);
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


router.get("/myAccounts", async (req, res) => {
  const { nidNumber } = req.query;
  if (!nidNumber) {
    return res.send({ success: false, message: "Nid number not valid" });
  }
  const accounts = await userAccountCollection.find({ nid_card_number: nidNumber }).toArray();
  return res.send(accounts);
})

router.get("/user-accounts", async (req, res) => {
  const { email } = req.query;
  const filter = { email: email };
  const result = await userAccountCollection.findOne(filter);
  res.send(result);
});

// deposit account -------------------------------

const findInterestRateAndMaturityValue = async (
  selectedAmount,
  selectedYears
) => {
  // console.log(selectedYears.toString())
  const query = { amountPerMonth: selectedAmount };
  const package = await depositPackage.findOne(query);
  // console.log("my package",package.years[selectedYears])

  if (package && package.years && package.years[selectedYears]) {
    return package.years[selectedYears];
  }

  return null;
};

router.post("/create-deposit-account", async (req, res) => {
  const account = req.body;
  // console.log(account)
  // console.log(selectedAmount,selectedYears)

  // Find the interest rate and maturity value based on user input
  const interestRateAndMaturityValue = await findInterestRateAndMaturityValue(
    account.amountPerMonth,
    account.selectedYears
  );
  // console.log("426", interestRateAndMaturityValue)

  if (interestRateAndMaturityValue) {

    const interestRate = interestRateAndMaturityValue.interestRate;
    const maturityValue = interestRateAndMaturityValue.maturityValue;
    account.interestRate = interestRate;
    account.maturityValue = maturityValue;
    const result = await userAccountCollection.insertOne(account);
    res.send(result);

  } else {
    res.json({
      message: "Data not found for the selected amount and years.",
    });
  }
});

module.exports = router;
