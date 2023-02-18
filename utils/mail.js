const nodemailer = require("nodemailer")

exports.generateOTP = (otp_length = 5) => {
  let OTP = "";
  for (let i = 0; i <= otp_length; i++) {
    OTP += Math.floor(Math.random() * 9);
  }

  return OTP;
};

exports.generateMailTransporter = () => nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });