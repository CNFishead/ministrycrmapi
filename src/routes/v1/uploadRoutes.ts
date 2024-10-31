import express from "express";
import { protect } from "../../middleware/auth";
import uploadPhoto from "../../controllers/upload/uploadPhoto";
import uploadCloudinary from "../../controllers/upload/uploadCloudinary";
const router = express.Router();

// Import all of our routes
router.route("/").post(uploadPhoto);
router.route("/cloudinary").post(uploadCloudinary);
router.use(protect()); // protect all routes below this line

export default router;
