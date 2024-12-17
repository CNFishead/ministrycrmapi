import express from 'express';
import getUsers from '../../../controllers/admin/user/getUsers';
import getUser from '../../../controllers/admin/user/getUser';
import updateUser from '../../../controllers/admin/user/updateUser';
const router = express.Router();

router.route('/').get(getUsers);
router.route('/:id').get(getUser).put(updateUser);
export default router;
