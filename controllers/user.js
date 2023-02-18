const BadRequestError = require("../errors/badRequestError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const EmailToken = require("../models/emailToken");
const PasswordResetToken = require("../models/passwordResetToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/errorHelper");
const NotFoundError = require("../errors/notFoundError");
const passwordResetToken = require("../models/passwordResetToken");
const user = require("../models/user");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  if (userExists) {
    throw new BadRequestError("Email is already registered");
  }

  const newUser = new User({ name, email, password });

  try {
    //save new user
    await newUser.save();
    let OTP = generateOTP();

    //generate newEmailToken in the database for the user
    const newEmailToken = new EmailToken({ owner: newUser._id, token: OTP });
    await newEmailToken.save();

    var transport = generateMailTransporter();
    transport.sendMail({
      from: "Verification@ourapp.com",
      to: newUser.email,
      subject: "Email Verification",
      html: `
      <p>Your verification OTP ${OTP}</p>`,
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new BadRequestError("This email is not registered");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) throw new BadRequestError("Password is not valid");

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({
    user: {
      id: user._id,
      name: user._name,
      email: user.email,
      isVerified: user.isVerified,
      token: jwtToken,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  //check if user id is valid
  if (!isValidObjectId(userId)) throw new BadRequestError("Invalid User Id");
  const user = await User.findById(userId);

  //check if user was already verified
  if (!user) throw new BadRequestError("User not found");
  if (user.isVerified) return sendError(res, "User is already verified", 200);

  //find the users email token, if there is one

  const token = await EmailToken.findOne({ owner: userId });
  if (!token) throw new NotFoundError("Token was not found");

  //compare otp from request and the otp from the token belonging to the user, verify the user then delete EmailToken

  const isMatch = await token.compareToken(OTP);
  if (!isMatch) throw new BadRequestError("Please submit a valid OTP");

  user.isVerified = true;
  await user.save();
  await EmailToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();
  transport.sendMail({
    from: "Verification@ourapp.com",
    to: user.email,
    subject: "Welcome email",
    html: `
    <p>Welcome to our app</p>`,
  });

  //last step sign token and send it to front

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: { name: user.name, id: user._id, email: user.email, token: jwtToken },
    message: "Your Email is verified",
  });
};

exports.resendEmailToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.json({ error: "user not found" });
  if (user.isVerified) return sendError(res, "User is already verified", 200);

  const token = await EmailToken.findOne({ owner: userId });
  if (token) return sendError(res, "Try again in 1 hour");

  let OTP = generateOTP();
  const newEmailToken = new EmailToken({ owner: user._id, token: OTP });
  await newEmailToken.save();

  const transport = generateMailTransporter();
  transport.sendMail({
    from: "Verification@ourapp.com",
    to: user.email,
    subject: "Welcome email",
    html: `
    <p>Welcome to our app</p>`,
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw BadRequestError("Email is missing");

  const user = await User.findOne({ email });
  if (!user) throw NotFoundError("User Not Found");

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken) return sendError(res, "Try again in 1 hour");

  const token = await generateRandomByte();

  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();
  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();
  transport.sendMail({
    from: "Verification@ourapp.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
    <p>Click here to reset password</p>
    <a href='${resetPasswordUrl}'>
    Change password
    </a>`,
  });
};

exports.passwordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;
  const user = await User.findById(userId);

  const isMatch = await user.comparePassword(newPassword);
  if (isMatch)
    throw new BadRequestError(
      "The new password must be different than the old one"
    );

  user.password = newPassword;
  await user.save();
  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  const transport = generateMailTransporter();
  transport.sendMail({
    from: "Verification@ourapp.com",
    to: user.email,
    subject: "Password reset successfuly",
    html: `
    <p>
    Password has been changed
    </p>`,
  });

  res.status(201).json({ message: "Password Reset Successfully" });
};
