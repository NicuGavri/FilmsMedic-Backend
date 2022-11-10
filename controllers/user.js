const BadRequestError = require("../errors/badRequestError");
const User = require("../models/user");

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
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(401).json(error);
  }
};
