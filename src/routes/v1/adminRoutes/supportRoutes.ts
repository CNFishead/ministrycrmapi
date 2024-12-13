import express from 'express';
import getSupportGroups from '../../../controllers/admin/support/getSupportGroups';
import createGroup from '../../../controllers/admin/support/createGroup';
import deleteGroup from '../../../controllers/admin/support/deleteGroup';
import updateGroup from '../../../controllers/admin/support/updateGroup';
const router = express.Router();

router.route('/support_group').get(getSupportGroups).post(createGroup);
router.route('/support_group/:id').delete(deleteGroup).put(updateGroup);

export default router;
