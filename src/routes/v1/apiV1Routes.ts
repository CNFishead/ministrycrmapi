import express from 'express';
import authRoutes from '../../modules/auth/routes/index';
import userRoutes from '../../modules/user/route/index';
import uploadRoutes from './uploadRoutes';
import ministryRoutes from '../../modules/ministry/routes/index'; 
import familyRoutes from './familyRoutes';
import notificationRoutes from '../../modules/notification/route/index';
import eventRoutes from './eventRoutes';
import utilRoutes from './utilRoutes';
import supportRoutes from './supportRoutes';
import profileRoutes from '../../modules/profiles/routes/index';

const router = express.Router();

// Import all of our routes
router.use('/auth', authRoutes);
router.use('/family', familyRoutes);
router.use('/user', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/ministry', ministryRoutes);
router.use('/notification', notificationRoutes);
router.use('/event', eventRoutes);
router.use('/util', utilRoutes);
router.use('/support', supportRoutes);
router.use('/profile', profileRoutes);

export default router;
