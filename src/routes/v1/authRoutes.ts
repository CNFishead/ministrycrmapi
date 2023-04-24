import express from 'express'
import register from '../../controllers/auth/register';
const router = express.Router()


// Import all of our routes
router.route('/register').post(register)

export default router;