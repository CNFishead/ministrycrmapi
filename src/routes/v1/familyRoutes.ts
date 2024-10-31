import express from "express";
import { protect } from "../../middleware/auth";
import createFamily from "../../controllers/family/createFamily";
import getFamilies from "../../controllers/family/getFamilies";
import getFamily from "../../controllers/family/getFamily";
import updateFamily from "../../controllers/family/updateFamily";
import addFamilyMember from "../../controllers/family/addFamilyMember";
import removeFamilyMember from "../../controllers/family/removeFamilyMember";
import deleteFamily from "../../controllers/family/deleteFamily";
const router = express.Router();

/**
 * @route /api/v1/family
 * @access Private
 * @description This is the route for the family object
 * @route GET /api/v1/family/:id - gets a family object
 * @route POST /api/v1/family - creates a family object
 * @route PUT /api/v1/family/:id - updates a family object
 * @route GET /api/v1/family - gets all family objects that belong to the user
 *
 * @version 1.0.4
 * @since 1.0
 * @lastModified 2023-06-25T16:33:05.000-05:00
 */
router.route("/").get(getFamilies);
router.route("/:id/removeMember/:memberId").put(removeFamilyMember);

router.use(protect());
router.route("/").post(createFamily);
router.route("/:id").get(getFamily).put(updateFamily).delete(deleteFamily);
router.route("/:id/addMember").put(addFamilyMember);

export default router;
