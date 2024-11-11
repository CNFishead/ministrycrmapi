import express from "express";
import register from "../../controllers/auth/register";
import login from "../../controllers/auth/login";
import forgotpassword from "../../controllers/auth/forgotpassword";
import checkUsername from "../../controllers/auth/checkUsername";
import checkEmailExists from "../../controllers/auth/checkEmailExists";
import getMe from "../../controllers/auth/getMe";
import recaptcha from "../../controllers/auth/recaptcha";
const router = express.Router();

// Import all of our routes
router.route("/:username/username").get(checkUsername);
router.route("/:email/email").get(checkEmailExists);
router.route("/register").post(register);
router.route("/recaptcha").post(recaptcha);
router.route("/forgot-password").post(forgotpassword);
router.route("/login").post(login);
router.route("/me").post(getMe);

export default router;
