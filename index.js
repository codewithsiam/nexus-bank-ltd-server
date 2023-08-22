const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
var morgan = require('morgan')
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
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

// Routes
const userRoutes = require("./routes/user");
const employeeRoutes = require("./routes/employee");

//
const usersCollection = client.db("nexusBankDB").collection("users")
const employeeCollection = client.db("nexusBankDB").collection("employees")
const loanCollection = client.db("nexusBankDB").collection("loans")
const paymentCollection = client.db("nexusBankDB").collection("transactions")

// use middleware----------------
app.use(employeeRoutes);
app.use(userRoutes);




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



// payment methods stripe----------------------------------------------------------------
app.post("/create-payment-intent", async (req, res) => {
    try {
        // console.log("hit success");
        const { amount } = req.body;
        const amountConvert = parseInt(amount * 100); // convert needed for stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountConvert,
            currency: "usd",
            payment_method_types: ["card"],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send("An error occurred while creating the payment intent");
    }
});


app.post("/payments", async (req, res) => {
    try {
        //   console.log("hit success");
        const payment = req.body;
        // Find user and update balance
        const user = await usersCollection.findOne({ email: payment.userEmail });
        if (user) {
            if (!user.balance) {
                user.balance = 0;
            }
            user.balance += payment.amount;
            await usersCollection.updateOne({ email: payment.userEmail }, { $set: user });
        } else {
            console.log("User not found");
        }

        // Save payment transaction to the database
        const postResult = await paymentCollection.insertOne(payment);
        res.send(postResult);
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).send("An error occurred while processing the payment");
    }
});


// end ------------

app.get("/", (req, res) => {
  res.send("Nexus Bank in Running");
});

app.listen(port, () => {
  console.log(`Nexus bank is running now in port:${port}`);
});
