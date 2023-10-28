import express from "express";
import { protect } from "../../middleware/auth";
import getMinistry from "../../controllers/ministry/getMinistry";
import updateMinistry from "../../controllers/ministry/updateMinistry";
import createMinistry from "../../controllers/ministry/createMinistry";
import getMinistries from "../../controllers/ministry/getMinistries";
import deleteMinistry from "../../controllers/ministry/deleteMinistry";
const router = express.Router();

// Import all of our routes
router.use(protect());
router.route("/:id/subministries/:subministryId").delete(deleteMinistry);
router.route("/:id/subministries").get(getMinistries).delete(deleteMinistry);
router.route("/:id").get(getMinistry).put(updateMinistry).post(createMinistry);

export default router;
