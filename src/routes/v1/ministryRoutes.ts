import express from 'express'
import { protect } from '../../middleware/auth';
import getMinistry from '../../controllers/ministry/getMinistry';
import updateMinistry from '../../controllers/ministry/updateMinistry';
const router = express.Router()


// Import all of our routes
router.use(protect())
router.route('/:id').get(getMinistry).put(updateMinistry)

export default router;