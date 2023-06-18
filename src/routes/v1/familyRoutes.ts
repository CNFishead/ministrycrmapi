import express from "express";
import { protect } from "../../middleware/auth";
import createFamily from "../../controllers/family/createFamily";
import getFamilies from "../../controllers/family/getFamilies";
const router = express.Router();

// Import all of our routes
router.use(protect());
router.route("/").post(createFamily).get(getFamilies);

export default router;
