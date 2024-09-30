import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Event from "../../models/Event";

/**
 * @description removes an object from the database
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
    // find the object needing to be updated
    await Event.findByIdAndDelete(req.params?.id);

    // return the updated family object
    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
