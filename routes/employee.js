const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

// Import MongoDB connection and employee collection
const { mongoClient, employeeCollection } = require("../index");
const { sendEmail } = require("../Modules/emailSend");
const { ObjectId } = require("mongodb");

// Define employee routes
router.get("/employees", async (req, res) => {
  try {
    const result = await employeeCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error retrieving employees:", error);
    res.status(500).send("Internal Server Error");
  }
});

// employee search-------------
router.get("/employees/:searchItem", async (req, res) => {
  const searchItem = req.params.searchItem;
  if (!searchItem) {
    return res.status(400).json({ error: "name parameter is required" });
  }
  const query = {
    $or: [
      { firstName: { $regex: searchItem, $options: "i" } },
      { lastName: { $regex: searchItem, $options: "i" } },
      { primaryEmail: { $regex: searchItem, $options: "i" } },
    ],
  };
  const result = await employeeCollection.find(query).toArray();
  res.send(result);
});

// employee filter by designation
router.get("/employeess/:filterItem", async (req, res) => {
  const filterItem = req.params.filterItem;

  if (filterItem === "All") {
    // If the filterItem is "all," return all employees
    const allEmployees = await employeeCollection.find({}).toArray();
    res.send(allEmployees);
  } else {
    // If a specific designation is provided, filter by that designation
    const query = { designation: filterItem };
    const result = await employeeCollection.find(query).toArray();
    res.send(result);
  }
});

router.post("/add-employee", async (req, res) => {
  const employee = req.body;
  console.log(employee);
  const query = { email: employee.email };
  const existingEmployee = await employeeCollection.findOne(query);
  if (existingEmployee) {
    return res.send({ message: "employee already exits" });
  }
  const hashedPassword = await bcrypt.hash(employee.password, 10);
  const newEmployee = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    username: employee.username,
    email: employee.email,
    designation: employee.designation,
    phoneNumber: employee.phoneNumber,
    password: hashedPassword,
  };
  const result = await employeeCollection.insertOne(newEmployee);

  res.send(result);
  const subject = `We are appointing you as a  (${employee.designation}) - Here are Your Login Credentials`;
  const htmlText = `
       
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Community</title>
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
    <h1>Welcome to Our Community</h1>
    <p> Here are your login credentials:</p>
    <p><span class="username">Username:</span> ${employee.username}</p>
    <p><span class="username">Password:</span> ${employee.password}</p>
    <p>Please keep your login information secure and do not share it with others. You can now use your username and password to access our admin Dashboard.</p>
    <p>If you have any questions or need assistance, please don't hesitate to <a href="mailto:nexusbltd@gmail.com">contact our support team</a>.</p>
    <p>Best regards,<br>Your Service Team<br>Nexus Bank LTD.</p>
  </div>
</body>
</html>

        `;
  await sendEmail(employee.email, subject, htmlText);
});

// delete employee -----------
router.patch('/delete-employee/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await employeeCollection.deleteOne(query);
  res.send(result);
});

// employee designation change ------------------
router.patch("/designation/:id", async(req,res)=>{
  const id = req.params.id;
  const designation = req.query.designation;
  console.log(designation)
  const query = {_id: new ObjectId(id)};
  const updateDoc = {
    $set:{
      designation:designation
    }
  }
  const result = await employeeCollection.updateOne(query,updateDoc);
  res.send(result);
})

module.exports = router;
