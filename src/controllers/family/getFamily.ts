import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Family from "../../models/Family";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseSortString from "../../utils/parseSortString";
import mongoose from "mongoose";

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
 * @lastModified      2023-11-08 20:40:17
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // find the family by id
    const [family] = await Family.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
        },
      },
      {
        $lookup: {
          // lookup from the members collection all users who have a family id that matches the family id in the family collection
          from: "members",
          localField: "members",
          foreignField: "_id",
          as: "members",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                profileImageUrl: 1,
              },
            },
          ],
        },
      },
    ]);
    // console.log(family);
    if (!family) {
      return res.status(401).json({ success: false, message: "Family not found" });
    }
    // return the family to the client
    return res.status(200).json({ success: true, family });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
