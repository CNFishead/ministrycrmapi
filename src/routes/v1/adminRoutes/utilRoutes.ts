import express from 'express'
import devtool from '../../../controllers/admin/devtool';
const router = express.Router()


// Import all of our routes
router.route('/').get(devtool);

export default router;