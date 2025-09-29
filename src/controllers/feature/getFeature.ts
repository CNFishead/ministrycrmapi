import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import mongoose from "mongoose"; 
import FeatureSchema from "../../modules/auth/models/FeatureSchema";

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
 * @version           1.0.2
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2024-11-03 20:57:03
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // find the family by id
    const [data] = await FeatureSchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
        },
      },
    ]);
    if (!data) {
      return res.status(401).json({ success: false, message: "Feature not found" });
    }
    return res.status(200).json({ success: true, payload: { ...data } });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
