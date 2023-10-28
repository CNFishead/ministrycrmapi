import Notification from "../../models/Notification";
import errorHandler from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import asyncHandler from "../../middleware/asyncHandler";
import { Response } from "express";

/**
 * @description - Creates a new notification for a user and saves it to the database
 *
 * @param {string} userTo - the user that the notification is for
 * @param {string} userFrom - the user that the notification is from
 * @param {string} notificationType - the type of notification
 * @param {string} entityId - the id of the entity that the notification is for
 *
 * @returns {object} - A success message and boolean
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastUpdatedBy Austin Howard
 * @lastUpdated 2023-07-28T14:55:17.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notification = new Notification({
      ...req.body,
    });
    await Notification.deleteOne({
      ...req.body,
    }).catch((err: any) => console.log(err));
    await Notification.create(notification).catch((err: any) => {
      console.log(err);
      return res.status(500).json({ message: "Notification not created", success: false });
    });
    return res.status(201).json({ message: "Notification created", success: true });
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
});
