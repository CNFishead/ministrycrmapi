import express from 'express'; 
import { AuthMiddleware } from '../../../middleware/AuthMiddleware';
import { MemberService } from '../services/Member.service';
const router = express.Router();

const service = new MemberService();

router.route('/').get(service.getResources);
router.route('/:id').get(service.getResource); 

router.use(AuthMiddleware.protect);
router.route('/').post(service.create);
router.route('/:id').put(service.updateResource).delete(service.removeResource);

router.use(AuthMiddleware.authorizeRoles(['admin', 'superadmin', 'legal']) as any);
export default router;
