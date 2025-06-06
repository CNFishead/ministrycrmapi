import express from 'express';
import { protect } from '../../middleware/auth';
import getMinistry from '../../controllers/ministry/getMinistry';
import updateMinistry from '../../controllers/ministry/updateMinistry';
import createMinistry from '../../controllers/ministry/createMinistry';
import getMinistries from '../../controllers/ministry/getMinistries';
import deleteMinistry from '../../controllers/ministry/deleteMinistry';
import checkInMembers from '../../controllers/member/checkInMembers';
import getMinistryAttendanceData from '../../controllers/ministry/getMinistryAttendanceData';
import memberGenderAnalytics from '../../controllers/member/memberGenderAnalytics';
const router = express.Router();

router.route('/:id').get(getMinistry);
router.route('/:id/checkin').post(checkInMembers);

router.use(protect());
router.route('/attendance/data').get(getMinistryAttendanceData);
router.route('/data/gender').get(memberGenderAnalytics);
router.route('/:id/subministries/:subministryId').delete(deleteMinistry);
router.route('/:id/subministries').get(getMinistries).delete(deleteMinistry);
router.route('/:id').put(updateMinistry).post(createMinistry);

export default router;
