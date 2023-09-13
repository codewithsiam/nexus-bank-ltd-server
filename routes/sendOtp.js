const express = require('express');
const router = express.Router();

const { optCollection, userAccountCollection } = require('../index');
const { sendEmail } = require('../Modules/emailSend');

// for generate OTP
const generateOTP = () => {
    const otp = Math.floor(10000 + Math.random() * 90000);
    return otp.toString();
};
// to store to the database
const generateAndStoreOTP = async (email) => {
    const otp = generateOTP();
    console.log(otp);

    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + 10 * 60000);
    // const expirationTimeString = new Date(expirationTime).toLocaleString();

    console.log(currentTime);
    console.log(expirationTime);

    await optCollection.insertOne({ email, otp, expiresAt: expirationTime });

    return otp;
};

// for verify otp and after that clear his all otp from the otp collection
const verifyAndClearOTP = async (email, userEnteredOTP) => {
    console.log(email, userEnteredOTP)
    const documents = await optCollection
        .find({ email })
        .sort({ expiresAt: -1 }) // Sort by expiresAt in descending order
        .limit(1)
        .toArray();

    const document = documents[0]; // Get the first (most recent) document
    console.log(document);

    if (!document) {
        return { verified: false, message: "OTP not found. Please request a new one." };
    }

    // const currentTime = new Date().getTime();
    // // const currentTimeString = new Date(currentTime).toLocaleString();
    // // const expirationTimeString = new Date(document.expiresAt).toLocaleString();
    // const currentTimeString = new Date(currentTime);
    // const expirationTimeString = new Date(document.expiresAt);

    // console.log("Current Time:", (currentTimeString));
    // console.log("Expires At:", (expirationTimeString));

    // if (expirationTimeString < currentTimeString) {
    //     return { verified: false, message: "You have entered an expired OTP. Please resend." };
    // }

    if (parseFloat(document.otp) === parseFloat(userEnteredOTP)) { //ensure that the otp is a number
        await optCollection.deleteMany({ email });
        return { verified: true, message: "OTP is valid." };
    } else {
        return { verified: false, message: "Invalid OTP. Please try again." };
    }
};


// accountNumber/email and username required 
router.get('/send-otp', async (req, res) => {
    const { accountNumber, email, userName } = req.query;

    try {

        if (!accountNumber && !email) {
            return res.status(400).json({ success: false, message: "Account number or email not found" });
        }

        let userEmail;

        if (accountNumber) {
            const user = await userAccountCollection.findOne({ accountNumber });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            userEmail = user.email;
        } else {
            // If an email is directly provided, use it
            userEmail = email;
        }

        // Generate and store OTP
        const otp = await generateAndStoreOTP(userEmail);

        // Email template
        const htmlText = `
        <html>
          <body>
            <p>Dear ${userName},</p>
            <p>Thank you for using our service.</p>
            <p>Your OTP for verification is:</p>
            <p style="font-size: 24px; font-weight: bold;">${otp}</p>
            <p>Please use this OTP to complete your verification process. Do not share this code with others.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
            <p>Best regards,<br>Nexus Bank LTD</p>
          </body>
        </html>
      `;

        const subject = 'OTP Verification';

        // Send the email with OTP
        const result = await sendEmail(userEmail, subject, htmlText);

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while sending the email." });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { accountNumber, email, otp } = req.query;
    console.log("sdfsdf",req.query);
    try {
        // Validation - Check if either accountNumber or email and otp are provided
        if ((!accountNumber && !email) || !otp) {
            return res.status(400).json({ status: false, message: "Account number or email or otp is missing" });
        }

        let userEmail;

        // If an accountNumber is provided, find the associated email
        if (accountNumber) {
            const user = await userAccountCollection.findOne({ accountNumber });

            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }

            userEmail = user.email;
        } else {
            // If an email is directly provided, use it
            userEmail = email;
        }
        console.log(userEmail);
        // Call the verifyAndClearOTP function
        const verificationResult = await verifyAndClearOTP(userEmail, otp);

        if (verificationResult.verified === true) {
            return res.status(200).json({ verified: true, message: 'OTP is valid.' });
        } else {
            return res.status(400).json(verificationResult);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while verifying the OTP." });
    }
});;

module.exports = router;
