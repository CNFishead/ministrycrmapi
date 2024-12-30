import express from 'express';
import getLegalFiles from '../../controllers/legal/getLegalFiles';
import getLegalFile from '../../controllers/legal/getLegalFile';
const router = express.Router();

router.route('/').get(getLegalFiles)
router.route('/:id').get(getLegalFile)

export default router;
