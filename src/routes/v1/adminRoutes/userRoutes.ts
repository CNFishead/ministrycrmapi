import express from 'express';
import { admin, protect } from '../../../middleware/auth';
import getUsers from '../../../controllers/admin/user/getUsers';
const router = express.Router();

router.route('/').get(getUsers);
export default router;
