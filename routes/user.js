const express = require("express");
const { create, verifyEmail, resendEmailToken, forgetPassword, passwordTokenStatus, resetPassword, signIn } = require("../controllers/user");
const { isPasswordTokenValid } = require("../middleware/user");
const { validate, userValidator, validatePassword } = require("../middleware/validator");
const { isAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/sign-in", signIn)
router.post("/verify-email",verifyEmail);
router.post("/resend-verification-token", resendEmailToken);
router.post("/forget-password", forgetPassword);
router.post("/verify-reset-password-token", isPasswordTokenValid, passwordTokenStatus);
router.post("/reset-password", validatePassword, validate, isPasswordTokenValid, resetPassword)
router.get("/is-auth",  isAuth, (req,res) => {
    const {user} = req
    res.json({user: {id: user._id, name: user.name, email: user.email}})
} )

module.exports = router;
