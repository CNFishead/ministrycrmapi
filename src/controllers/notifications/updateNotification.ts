import Notification from "../../models/Notification";
import errorHandler from "../../middleware/error";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { NextFunction, Response } from "express";

export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params!;
    if (!id) {
      // if an id is not provided the user is trying to update all of their notifications
      try {
        await Notification.updateMany({ userTo: req.user._id }, { opened: true });
        return res.status(200).json({
          success: true,
        });
      } catch (error) {
        errorHandler(error, req, res, next);
      }
    }

    const updatedNotify = await Notification.findByIdAndUpdate(id, { opened: true });
    if (!updatedNotify) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    errorHandler(error, req, res, next);
  }
});
