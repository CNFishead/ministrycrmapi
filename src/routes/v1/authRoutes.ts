import express from 'express'
import register from '../../controllers/auth/register';
import login from '../../controllers/auth/login';
const router = express.Router()


// Import all of our routes
router.route('/register').post(register)
router.route('/login').post(login)

export default router;