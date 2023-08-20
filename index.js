const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
var morgan = require("morgan");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// import nice
// const userRoutes = require('./routes/user')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.13jglcb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("nexusBankDB").collection("users");
    const employeeCollection = client.db("nexusBankDB").collection("employees");
    const loanCollection = client.db("nexusBankDB").collection("loans");

    app.get("/employees", async (req, res) => {
      const result = await employeeCollection.find().toArray();
      res.send(result);
    });

    // add all loan request that creates the user : by default it is pending
    app.post("/apply-loan", async (req, res) => {
      try {
        const data = req.body;
        const result = await loanCollection.insertOne(data);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error submitting loan application:", error);
        res.status(500).json({ message: "Loan application submission failed" });
      }
    });

    // users
    app.get("/addUser", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exits" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // app.use(userRoutes)
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// start---------

// Export MongoDB connection and employee collection
exports.mongoClient = client;
exports.employeeCollection = client.db("nexusBankDB").collection("employees");

// Routes
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employee");

// use middleware----------------
app.use(employeeRoutes);
app.use(userRoutes);

// end ------------

app.get("/", (req, res) => {
  res.send("Nexus Bank in Running");
});

app.listen(port, () => {
  console.log(`Nexus bank is running now in port:${port}`);
});
