import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Family from "../../models/Family";

/**
 * @description       Gets a family from the database, that belongs to the account user, and returns it to the client
 * @route             GET /api/v1/family/:id
 * @access            Private
 *
 * @param req         Request
 * @param res         Response
 * @param next        NextFunction
 *
 * @returns           { Object } { success: true, family: family }
 *
 * @author            Austin Howard
 * @version           1.0.0
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2023-06-24T12:19:57.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // find the family by id
    const family = await Family.findOne({ _id: req.params?.id, user: req.user._id }).populate("members");
    if (!family) {
      return res.status(404).json({ success: false, error: "Family not found" });
    }
    // return the family to the client
    return res.status(200).json({ success: true, family });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
