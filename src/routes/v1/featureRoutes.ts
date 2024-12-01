import express from "express";
import createFeature from "../../controllers/feature/createFeature";
import { admin, protect } from "../../middleware/auth";
import getFeatures from "../../controllers/feature/getFeatures";
import updateFeature from "../../controllers/feature/updateFeature";
import getFeature from "../../controllers/feature/getFeature";
import removeFeature from "../../controllers/feature/removeFeature";
const router = express.Router();

router.route("/").get(getFeatures);

router.use(protect());
// Import all of our routes
router.route("/").post(createFeature);

router.use(admin(["admin"]));
router.route("/:id").put(updateFeature).get(getFeature).delete(removeFeature);
export default router;
