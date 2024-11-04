import express from "express";
import { protect } from "../../middleware/auth";
import createMember from "../../controllers/member/createMember";
import getMembers from "../../controllers/member/getMembers";
import getMember from "../../controllers/member/getMember";
import updateMember from "../../controllers/member/updateMember";
import deleteMember from "../../controllers/member/deleteMember";
const router = express.Router();

// Import all of our routes
router.use(protect);
router.route("/").post(createMember);
router.route("/:memberId").delete(deleteMember);
router.route("/:memberId/update").put(updateMember);
router.route("/details/:memberId").get(getMember);
router.route("/:ministryId").get(getMembers);

export default router;
