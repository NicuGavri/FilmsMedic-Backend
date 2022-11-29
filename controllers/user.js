const BadRequestError = require("../errors/badRequestError");
const User = require("../models/user");
const EmailToken = require("../models/emailToken");
const nodemailer = require("nodemailer")

exports.create = async (req, res) => {

  const { name, email, password } = req.body;
  const userExists = await User.findOne({email})

  if (!name || !email || !password) {
    throw new BadRequestError('please provide all values');
  }

  if(userExists) {
    throw new BadRequestError('Email is already registered');
  }

  const newUser = new User({ name, email, password });

  try {
    await newUser.save();

    //generate otp
    //store otp in database
    //send otp to user
    let OTP = ''
    for(let i = 0; i <= 5; i++) {
     OTP += Math.floor(Math.random() * 9)
    }

    const newEmailToken = new EmailToken({owner: newUser._id, token: OTP})
     await newEmailToken.save()
     console.log(process.env.MAIL_USER)

    var transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    transport.sendMail({
      from: 'Verification@ourapp.com',
      to: newUser.email,
      subject: "Email Verification",
      html: `
      <p>Your verification OTP ${OTP}</p>`
    })

    res.status(201).json("Please verify your email. An 6 digit code was sent to your email account.");
  } catch (error) {
    res.status(401).json(error);
  }
};
