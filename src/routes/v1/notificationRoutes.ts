import express from 'express';
const router = express.Router();
import { protect, admin } from '../../middleware/auth';
import getNotifications from '../../controllers/notifications/getNotifications';
import createNotification from '../../controllers/notifications/createNotification';
import updateNotification from '../../controllers/notifications/updateNotification';
/**
 * @description - API routes for notifications
 * @access      Private - Only logged in users can access the routes
 *
 * @route       GET /api/notifications - returns all notifications for a user
 * @route       GET /api/notifications/:id - returns a single notification
 * @route       PUT /api/notifications/:id - updates a single notification
 * @route       DELETE /api/notifications/:id - deletes a single notification
 * @route       UPDATE /api/notifications/all - updates all notifications to read
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastUpdatedBy Austin Howard
 * @lastUpdated 2023-07-28T14:55:17.000-05:00
 */
router.use(protect);

router.route('/').get(getNotifications).post(createNotification); // get all notifications and create a notification
router.route('/all').put(updateNotification); // update all notifications to read
router.route('/:id').put(updateNotification).delete(); // update a single notification and delete a single notification

export default router;