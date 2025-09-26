import express from 'express';
import authRoutes from '../../modules/auth/routes/index';
import userRoutes from './userRoutes';
import uploadRoutes from './uploadRoutes';
import ministryRoutes from './ministryRoutes';
import memberRoutes from './memberRoutes';
import familyRoutes from './familyRoutes';
import notificationRoutes from './notificationRoutes';
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
router.use('/admin', adminRoutes);
router.use('/family', familyRoutes);
router.use('/user', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/ministry', ministryRoutes);
router.use('/member', memberRoutes);
router.use('/notification', notificationRoutes);
router.use('/event', eventRoutes);
router.use('/util', utilRoutes);
router.use('/feature', featureRoutes);
router.use('/apikey', apikeyRoutes);
router.use('/support', supportRoutes);
router.use('/legal', legalRoutes);

export default router;
