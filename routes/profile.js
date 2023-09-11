const express = require('express');
const router = express.Router();
const { ObjectId } = require("mongodb");

const { userAccountCollection , usersCollection} = require('../index');

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

    // const options = { upsert: true };
    const updateDoc = {
      $set: {
        nationality: body.nationality,
        birthday: body.birthday,
        gender: body.gender,
        profession: body.profession,
        number: body.number,
        description: body.description,
        nickname: body.nickName,
        presentAddress: body.presentAddress,
        permanentAddress: body.permanentAddress
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

// Endpoint for changing the password
router.post('/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Replace this with your actual user authentication logic
  const user = userAccountCollection.find((inputPass) => inputPass.password === oldPassword);
  if (!user) {
    return res.status(401).json({ error: 'Invalid old password' });
  }

  // Update the user's password with the new password
  user.password = newPassword;
  res.status(200).json({ message: 'Password changed successfully' });
});

module.exports = router;
