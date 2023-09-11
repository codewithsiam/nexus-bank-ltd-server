const express = require('express');
const router = express.Router();

const { userAccountCollection , usersCollection} = require('../index');

// .........update user profile data............

router.patch("/update-Profile/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const body = req.body;

    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        nationality: body.nationality,
        birthDate: body.birthDate,
        gender: body.gender,
        profession: body.profession,
        number: body.number,
        description: body.description,
      },
    };

    const result = await usersCollection.updateOne(filter, updateDoc, options);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
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
