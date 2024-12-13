import express from 'express';
import { admin, protect } from '../../../middleware/auth';
import utilRoutes from './utilRoutes'; 
import supportRoutes from './supportRoutes';
import userRoutes from './userRoutes';
const router = express.Router();

// Import all of our routes
// protect all routes below this line
router.use(protect(), admin(['admin'])); 
router.use('/util', utilRoutes);
router.use('/user', userRoutes);
router.use('/support', supportRoutes);



export default router;
