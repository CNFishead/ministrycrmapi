import express from 'express'
import getMe from '../../controllers/user/getMe';
import { protect } from '../../middleware/auth';
import updateUser from '../../controllers/user/updateUser';
const router = express.Router()


// Import all of our routes
router.use(protect())
router.route('/me').get(getMe)
router.route('/').put(updateUser)

export default router;