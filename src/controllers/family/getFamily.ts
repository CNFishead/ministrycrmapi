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
    const family = await Family.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
          user: req.user._id,
          $and: [{ ...parseFilterOptions(req.query?.filterOptions as string) }],
          $or: [...parseQueryKeywords(["fullName", "email", "phoneNumber", "tags"], req.query?.keyword as string)],
        },
      },
      {
        $setWindowFields: { output: { totalCount: { $count: {} } } },
      },
      {
        $sort: {
          ...parseSortString(req.query?.sortBy as string, "createdAt;-1"),
        },
      },
      {
        $skip: Number(req.query?.limit) * (Number(req.query?.pageNumber) - 1),
      },
      {
        $limit: Number(req.query?.limit),
      },
      {
        $lookup: {
          // lookup from the members collection all users who have a family id that matches the family id in the family collection
          from: "members",
          localField: "_id",
          foreignField: "family",
          as: "members",
        },
      },
    ]);
    if (!family[0]) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }
    // return the family to the client
    return res.status(200).json({ success: true, family: family[0] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
