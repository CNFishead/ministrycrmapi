import express from 'express';
import { admin, protect } from '../../middleware/auth';
import createKey from '../../controllers/key/createKey';
import getKeys from '../../controllers/key/getKeys';
import getKey from '../../controllers/key/getKey';
import updateKey from '../../controllers/key/updateKey';
import deleteKey from '../../controllers/key/deleteKey';
const router = express.Router();

// Import all of our routes
// protect all routes below this line
router.use(protect());
router.route('/').get(getKeys).post(createKey);
router.route('/:id').get(getKey).delete(deleteKey);

// only admins can update keys
router.route('/:id').put(admin(['admin']), updateKey);

export default router;
