const express = require("express");
const router = express.Router();

// Import MongoDB connection and employee collection
const { mongoClient, employeeCollection } = require("../index");

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

// employee search
router.get("/employees/:searchItem", async (req, res) => {
  const searchItem = req.params.searchItem;
  if (!searchItem) {
    return res.status(400).json({ error: "name parameter is required" });
  }
  const query = {
    $or: [{ name: { $regex: searchItem, $options: "i" } }],
  };
  const result = await employeeCollection.find(query).toArray();
  res.send(result);
});

// employee filter by designation 
router.get("/employeess/:filterItem",async(req,res)=>{
  const designation = req.params.filterItem;
  if(!designation){
    return res.status(400).json({error:"designation is required"})
  }
  const query = {designation:designation};
  const result = await employeeCollection.find(query).toArray();
  res.send(result)
})

module.exports = router;
