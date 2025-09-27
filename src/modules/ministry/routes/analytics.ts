import express from 'express'; 
import { AuthMiddleware } from '../../../middleware/AuthMiddleware';
import { AnalyticService } from '../services/Analytics.service';
const router = express.Router();

const service = new AnalyticService();
 

router.use(AuthMiddleware.protect); 
router.route('/attendance/data').get(service.attendanceData);
router.route('/data/gender').get(service.genderDistribution);

router.use(AuthMiddleware.authorizeRoles(['admin', 'superadmin']) as any);

export default router;
