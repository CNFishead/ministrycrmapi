import express from 'express'
import getMe from '../../controllers/user/getMe';
import { protect } from '../../middleware/auth';
const router = express.Router()


// Import all of our routes
router.use(protect())
router.route('/me').get(getMe)

export default router;