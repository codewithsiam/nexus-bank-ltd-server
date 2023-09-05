const nodemailer = require("nodemailer");

module.exports.sendEmail = (receiver, subject, htmlText) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abusayedalsiam2023@gmail.com",
        pass: "ymirpcniazkpnsoc",
      },
    });

    const mailOptions = {
      from: "abusayedalsiam2023@gmail.com", 
      to: receiver,
      subject: subject,
      html: htmlText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return reject({sendEmail:false, message: "An error has occurred!" });
      }
      console.log("Email sent:", info.response);
      return resolve({sendEmail:true, message: "Email has been sent successfully!" });
    });
  });
};