import express from 'express'
import { protect } from '../../middleware/auth';
import createMember from '../../controllers/member/createMember';
import getMembers from '../../controllers/member/getMembers';
const router = express.Router()


// Import all of our routes
router.use(protect())
router.route('/').post(createMember)
router.route('/:ministryId').get(getMembers)

export default router;