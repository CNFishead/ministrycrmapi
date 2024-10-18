import express from 'express'
import { protect } from '../../middleware/auth';
import uploadPhoto from '../../controllers/upload/uploadPhoto';
const router = express.Router()


// Import all of our routes
router.route('/').post(uploadPhoto)
router.use(protect()) // protect all routes below this line

export default router;