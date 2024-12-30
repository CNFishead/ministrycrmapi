import express from 'express';
import createLegalFile from '../../../controllers/legal/createLegalFile';
import updateLegalFile from '../../../controllers/legal/updateLegalFile';
import deleteLegalFile from '../../../controllers/legal/deleteLegalFile';
const router = express.Router();

// Import all of our routes
router.route('/').post(createLegalFile);
router.route('/:id').put(updateLegalFile).delete(deleteLegalFile);

export default router;
