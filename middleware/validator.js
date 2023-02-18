const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name was not provided"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Email is invalid"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password was not provided!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long"),
];


exports.validatePassword = [
  check("newPassword")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Password was not provided!")
  .isLength({ min: 8, max: 20 })
  .withMessage("Password must be 8 to 20 characters long"),
]

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if(error.length){
    return res.status(401).json({error : error[0].msg})
  }
  next();
};
