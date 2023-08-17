const express = require('express');
const router = express.Router();

// Import MongoDB connection and employee collection
const { mongoClient, employeeCollection } = require('../index');

// Define employee routes
router.get('/employees', async (req, res) => {
  try {
    const result = await employeeCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error retrieving employees:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;