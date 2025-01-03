import express from 'express';
import { protect, admin } from '../../middleware/auth';
import createSupportGroup from '../../controllers/support/createSupportGroup';
import getSupportGroups from '../../controllers/support/getSupportGroups';
import createTicket from '../../controllers/support/createTicket';
import getTickets from '../../controllers/support/getTickets';
import getTicket from '../../controllers/support/getTicket';
import getMessages from '../../controllers/support/getMessages';
import addMessage from '../../controllers/support/addMessage';
import updateTicket from '../../controllers/support/updateTicket';
import getAgents from '../../controllers/support/getAgents';
import deleteTicket from '../../controllers/support/deleteTicket';
const router = express.Router();

router.route('/').get(getSupportGroups);

router.route('/agents/:id').get(getAgents);

router.route('/ticket').post(createTicket).get(getTickets);
router.route('/ticket/:id').get(getTicket).put(updateTicket).delete(deleteTicket);
router.route('/ticket/:id/message').get(getMessages).post(addMessage);

// Import all of our routes
router.use(protect());

router.route('/').post(admin(['admin']), createSupportGroup);

export default router;
