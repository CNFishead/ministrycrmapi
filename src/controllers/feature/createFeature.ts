import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import FeatureSchema from "../../models/FeatureSchema";

/**
 * @description          Creates an object in the database.
 * @route                POST /api/v1/feature
 * @access               Private
 *
 * @returns              response object containing a message and a success boolean
 * @author               Austin Howard
 * @version              1.0.0
 * @since                1.0.0
 * @lastModifiedBy       Austin Howard
 * @lastModified         2023-06-18T15:03:34.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const newFamily = await FeatureSchema.create({
      user: req.user._id,
      ...req.body,
    });
    return res.status(201).json({
      success: true,
      data: newFamily,
    });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
