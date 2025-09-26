import express from 'express';
import AuthService from '../services/Auth.service';
import { AuthMiddleware } from '../../../middleware/AuthMiddleware'; 
const router = express.Router();

const authService = new AuthService();

// router.use('/feature', featureRoutes);
// router.use('/plan', planRoutes);
// router.use('/claim', claimRoutes);
// router.use('/legal', legalRoutes);
// router.use('/billing', billingRoutes);

router.route('/:email/email').get(authService.checkEmail);
router.post('/register', authService.register);
router.route('/recaptcha').post(authService.recaptcha);
router.route('/reset-password/:resettoken').put(authService.resetPassword);
router.route('/forgot-password').post(authService.forgotPassword);
router.route('/verifyEmail').post(authService.verifyEmail);
router.route('/resend-verification-email').post(authService.resendVerificationEmail);
router.route('/login').post(authService.login);
router.route('/health').get((req, res) => {
  res.status(200).json({
    message: 'Auth service is up and running',
    success: true,
  });
});

// authenticated routes
router.get('/me', AuthMiddleware.protect, authService.getMe);
export default router;
