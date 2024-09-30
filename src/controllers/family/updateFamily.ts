import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Family from "../../models/Family";

/**
 * @description updates a family object in the database
 * @route PUT /api/v1/family/:id
 * @access Private
 * @param {AuthenticatedRequest} req - authenticated request containing family id
 * @param {Response} res - response object
 * @param {NextFunction} next - next function
 *
 * @author Austin Howard
 * @version 1.0
 * @since   1.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-06-25T16:33:05.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try { 
    // find the family object needing to be updated
    const family = await Family.findById(req.params?.id);
    // check if it exists
    if (!family) {
      // return a 404 if it does not
      return res.status(404).json({
        success: false,
        message: "No family found",
      });
    }
    // check if the user is the owner of the family
    if (family?.user?.toString() !== req.user?._id.toString()) {
      // return a 401 if they are not
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    // update the family object
    const updatedFamily = await Family.findByIdAndUpdate(
      family._id,
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
      family: updatedFamily, 
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
