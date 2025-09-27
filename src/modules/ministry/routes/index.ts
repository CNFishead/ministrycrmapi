import express from 'express'; 
import { AuthMiddleware } from '../../../middleware/AuthMiddleware';
import { MinistryService } from '../services/Ministry.service';
import memberRoutes from './member';
const router = express.Router();

const service = new MinistryService();

router.use('/member', memberRoutes);


router.route('/').get(service.getResources);
router.route('/:id').get(service.getResource); 
// router.route('/:id/checkin').post(checkInMembers);

router.use(AuthMiddleware.protect);
router.route('/:id').put(service.updateResource).delete(service.removeResource).post(service.create);
router.route('/:id/subministries/:subministryId').delete(service.removeResource);
router.route('/:id/subministries').get(service.getResources).delete(service.removeResource);

router.use(AuthMiddleware.authorizeRoles(['admin', 'superadmin']) as any);

export default router;
