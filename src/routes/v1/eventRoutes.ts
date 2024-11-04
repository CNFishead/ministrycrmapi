import express from "express";
import { protect } from "../../middleware/auth";
import getEvents from "../../controllers/event/getEvents";
import createEvent from "../../controllers/event/createEvent";
import updateEvent from "../../controllers/event/updateEvent";
import deleteEvent from "../../controllers/event/deleteEvent";
const router = express.Router();

// Import all of our routes
router.use(protect);
router.route("/").get(getEvents).post(createEvent);
router.route("/:id").get().put(updateEvent).delete(deleteEvent);

export default router;
