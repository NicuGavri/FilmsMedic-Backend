const jwt = require("jsonwebtoken");
const User = require("../models/user");
const BadRequestError = require("../errors/badRequestError");


exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;

  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) throw new BadRequestError('Invalid Token');
  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;

  const user = await User.findById(userId);
  if (!user) throw new BadRequestError("Invalid token user not found!");

  req.user = user;
  next();
};
