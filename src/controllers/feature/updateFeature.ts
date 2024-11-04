import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Family from "../../models/Family";
import FeatureSchema from "../../models/FeatureSchema";

/**
 * @description updates an object in the database
 * @access Private
 * @param {AuthenticatedRequest} req - authenticated request containing family id
 * @param {Response} res - response object
 * @param {NextFunction} next - next function
 *
 * @author Austin Howard
 * @version 1.0
 * @since   1.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-11-03 21:02:12
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await FeatureSchema.findById(req.params?.id);
    // check if it exists
    if (!data) {
      // return a 404 if it does not
      return res.status(404).json({
        success: false,
        message: `No feature found with the id of ${req.params?.id}`,
      });
    }
    await FeatureSchema.findByIdAndUpdate(
      data._id,
      {
        ...req.body,
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
