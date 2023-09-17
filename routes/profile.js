const express = require('express');
const router = express.Router();
const { ObjectId } = require("mongodb");

const {usersCollection, reviewCollection} = require('../index');

// .........update user profile data............
router.patch("/update-Profile/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const body = req.body;
    const userInfo = await usersCollection.findOne(query);
    
    if (!userInfo) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateDoc = {
      $set: {
        last_name: body.last_name,
        first_name: body.first_name,
        profession: body.profession,
        email: body.email,
        birthday: body.birthday,
        gender: body.gender,
        number: body.number,
        nationality: body.nationality,
        description: body.description,
        present_address: body.present_address,
        permanent_address: body.permanent_address,
        profile_image: body.profile_image
      },
    };

    const result = await usersCollection.updateOne(userInfo, updateDoc);
    const updatedUser = await usersCollection.findOne(query);

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// .............give feedback about bank...........
router.post("/user-reviews", async (req, res) => {
  const review = req.body;
  console.log(review);
  const query = { email: review?.email };

  const existingReview = await reviewCollection.findOne(query);
  if (existingReview) {
    return res.send({ message: "User already submitted a review" });
  }

  const result = await reviewCollection.insertOne(review);
  res.send(result);
});

router.get("/user-reviews", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});

// .............show feedback in testimonial part...........
router.get("/user-feedback", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});

module.exports = router;
