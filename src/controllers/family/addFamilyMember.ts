import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Family from "../../models/Family";

/**
 * @description       Adds a family member to the family object in the database
 * @route             POST /api/v1/family/:id/addMember
 * @access            Private
 *
 * @param req         Request
 * @param res         Response
 * @param next        NextFunction
 *
 * @returns           { Object } { success: true, family: family }
 * @author            Austin Howard
 * @version           1.0.0
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2023-06-25T16:33:05.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // find the family
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
    if (family?.user?.toString() !== (req.user as { _id: string })._id.toString()) {
      // return a 401 if they are not
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    // add the member to the family
    family.members.push(req.body.members);
    // save the family
    await family.save();
    // return the family
    return res.status(200).json({
      success: true,
      family: family,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
