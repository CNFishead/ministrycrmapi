import express from 'express'
import { protect } from '../../middleware/auth'; 
import devtool from '../../controllers/admin/devtool';
const router = express.Router()


// Import all of our routes
router.use(protect) // protect all routes below this line
router.route('/').get(devtool);

export default router;