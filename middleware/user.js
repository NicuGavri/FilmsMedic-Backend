const { isValidObjectId } = require("mongoose");
const BadRequestError = require("../errors/badRequestError");
const PasswordResetToken = require("../models/passwordResetToken");

exports.isPasswordTokenValid = async (req, res, next) => {
  const { token, userId } = req.body;

  console.log(token, userId, 'logs')

  if (!token.trim() || !isValidObjectId(userId))
    throw new BadRequestError("Something went wrong. Please try again");

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken) throw new BadRequestError("Reset password token has expired. Please navigate to the forgot password page.");

  const isMatched = resetToken.compareToken(token);
  if (!isMatched) {
    throw new BadRequestError("Not good");
  } else {
    req.resetToken = resetToken;
    return next();
  }
};
