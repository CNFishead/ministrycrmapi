import express from 'express';
import authRoutes from '../../modules/auth/routes/index';
import userRoutes from '../../modules/user/route/index';
import uploadRoutes from './uploadRoutes';
import ministryRoutes from './ministryRoutes';
import memberRoutes from './memberRoutes';
import familyRoutes from './familyRoutes';
import notificationRoutes from '../../modules/notification/route/index';
import eventRoutes from './eventRoutes';
import utilRoutes from './utilRoutes';
import featureRoutes from './featureRoutes';
import apikeyRoutes from './apiKeyRoutes';
import supportRoutes from './supportRoutes';
import adminRoutes from './adminRoutes/adminRoutes';
import legalRoutes from './legalRoutes';

const router = express.Router();

// Import all of our routes
router.use('/auth', authRoutes);
router.use('/family', familyRoutes);
router.use('/user', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/ministry', ministryRoutes);
router.use('/member', memberRoutes);
router.use('/notification', notificationRoutes);
router.use('/event', eventRoutes);
router.use('/util', utilRoutes);
router.use('/support', supportRoutes);

export default router;
