const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5500;
// middleware
app.use(cors());
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

    // const employeeCollection = client.db("nexusBankDB").collection("employees");

    // app.get("/employees", async (req, res) => {
    //   const result = await employeeCollection.find().toArray();
    //   res.send(result);
    // });

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
const userRoutes = require('./routes/user');
const employeeRoutes = require('./routes/employee');

app.use(employeeRoutes);
app.use(userRoutes);

// end ------------

app.get("/", (req, res) => {
  res.send("Nexus Bank in Running");
});

app.listen(port, () => {
  console.log(`Nexus bank is running now in port:${port}`);
});
