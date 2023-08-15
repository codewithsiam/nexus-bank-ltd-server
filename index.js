const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3500;
// middleware
app.use(cors());
app.use(express.json());

// import nice 
const userRoutes = require('./routes/user')

app.get("/",(req,res)=>{
    res.send("Nexus Bank in Running")
})
app.use(userRoutes)

app.listen(port,()=>{
    console.log(`Nexus bank is running now in port:${port}`)
})