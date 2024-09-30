import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Event from "../../models/Event";

/**
 * @description updates an object in the database
 * @param {AuthenticatedRequest} req - authenticated request containing family id
 * @param {Response} res - response object
 * @param {NextFunction} next - next function
 *
 * @author Austin Howard
 * @version 1.0
 * @since   1.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-09-29 13:53:21
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    // find the object needing to be updated
    await Event.findByIdAndUpdate(
      req.params?.id,
      {
        ...req.body,
        startDate: req.body.dates[0],
        endDate: req.body.dates[1],
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // return the updated family object
    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
