const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
var morgan = require("morgan");


// socket io connect start
const http = require('http')

const { Server } = require('socket.io')

const server = http.createServer(app)
exports.io = new Server(server, {
  cors: {
    origin: "*"
  }
})


// socket io connectEnd



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
exports.usersCollection = client.db("nexusBankDB").collection("users");
exports.loanCollection = client.db("nexusBankDB").collection("loans");
exports.paymentCollection = client.db("nexusBankDB").collection("transactions");
exports.userAccountCollection = client.db("nexusBankDB").collection("userAccounts");
exports.optCollection = client.db("nexusBankDB").collection("otps");
exports.depositPackage = client.db("nexusBankDB").collection("depositPackage");
exports.creditCardCollection = client.db("nexusBankDB").collection("creditCardCollection")
exports.depositPackage = client.db("nexusBankDB").collection("depositPackage")
exports.blogsCollection = client.db("nexusBankDB").collection("blogs")
exports.customerCollection = client.db("nexusBankDB").collection("support")


// Routes-------------------
const employeeRoutes = require("./routes/employee");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payments");
const router = require("./routes/chat");
const { connect } = require("http2");
const authCheckRoutes = require("./routes/authCheck");
const userAccounts = require("./routes/userAccounts")
const loanRoutes = require("./routes/loan")
const moneyTransfer = require("./routes/moneyTransfer")
const profile = require("./routes/profile")
const sendOtp = require("./routes/sendOtp")
const customerSupport = require('./routes/customer')
const creditCardRoute = require("./routes/credit-card")
const blogs=require("./routes/blog")


// use middleware-------------------------
app.use(employeeRoutes);
app.use(userRoutes);
app.use(paymentRoutes);
app.use(router);
app.use(authCheckRoutes);
app.use(loanRoutes);
app.use(moneyTransfer);
app.use(userAccounts);
app.use(profile);
app.use(sendOtp);
app.use(creditCardRoute);
app.use(blogs)
app.use(customerSupport)


app.get("/", (req, res) => {
  res.send("Nexus Bank in Running");
});




server.listen(port, () => {
  console.log(`Nexus bank is running now in port:${port}`);
});
