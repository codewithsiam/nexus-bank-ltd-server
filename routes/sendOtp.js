const express = require('express');
const router = express.Router();

const { optCollection } = require('../index');
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
    const expirationTime = new Date(currentTime.getTime() + 3 * 60 * 1000);
    const expirationTimeString = new Date(expirationTime).toLocaleString();

    console.log(currentTime);
    console.log(expirationTimeString);

    await optCollection.insertOne({ email, otp, expiresAt: expirationTimeString });

    return otp;
};

// for verify otp and after that clear his all otp from the otp collection
const verifyAndClearOTP = async (email, userEnteredOTP) => {
    console.log(email, userEnteredOTP)
    const documents = await optCollection.find({ email }).sort({ expiresAt: -1 }).limit(1).toArray();
    const document = documents[0]; // Get the first (most recent) document
    console.log(document);

    if (!document) {
        return { verified: false, message: "OTP not found. Please request a new one." };
    }

    const currentTime = new Date().getTime();
    const currentTimeString = new Date(currentTime).toLocaleString();
    const expirationTimeString = new Date(document.expiresAt).toLocaleString();

    console.log("Current Time:", new Date(currentTime).toLocaleString());
    console.log("Expires At:", new Date(expirationTimeString).toLocaleString());

    if (expirationTimeString < currentTimeString) {
        return { verified: false, message: "You have entered an expired OTP. Please resend." };
    }

    if (parseFloat(document.otp) === parseFloat(userEnteredOTP)) { //ensure that the otp is a number
        await optCollection.deleteMany({ email });
        return { verified: true, message: "OTP is valid." };
    } else {
        return { verified: false, message: "Invalid OTP. Please try again." };
    }
};



router.get('/send-otp', async (req, res) => {
    try {
        const { email, userName } = req.query;
        //validation 
        if (!email) {
            res.send({ send: false, message: "Email not found" });
            return;
        }
        const otp = await generateAndStoreOTP(email);
        console.log(otp);
// email template 
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
// call the email function to send the otp
        const result = await sendEmail(email, subject, htmlText);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while sending the email." });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.query;
        // validation 
        if (!email && !otp) {
            res.send({ status: false, message: "email or otp is missing" });
            return;
        }
        // call the verifyAndClear OTP function
        const verificationResult = await verifyAndClearOTP(email, otp);

        if (verificationResult.verified === true) {
            return res.status(200).json({ verified: true, message: 'OTP is valid.' });
        } else {
            return res.status(400).json({ verified: false, message: verificationResult });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while verifying the OTP." });
    }
});

module.exports = router;
