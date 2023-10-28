import { Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import mongoose from "mongoose";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseSortString from "../../utils/parseSortString";
import Ministry from "../../models/Ministry";

/**
 * @description - This function will return all members for a ministry, and all sub ministry members.
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object[]} members: The members of the ministry
 *
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModifiedBy - Austin Howard
 * @lastModified - 2023-06-11T11:37:23.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const pageSize = Number(req.query?.limit) || 10;
    const page = Number(req.query?.pageNumber) || 1;
    const ministryId = req.params?.id;
    if (!ministryId) return res.status(400).json({ message: "Ministry ID is required", success: false });

    // find the members we are searching for, through the ministry thats passed in
    const ministry = await Ministry.aggregate([
      {
        $match: {
          ownerMinistry: new mongoose.Types.ObjectId(ministryId),
          $and: [{ ...parseFilterOptions(req.query?.filterOptions) }],
          $or: [
            ...parseQueryKeywords(["name", "description", "[ministryType]", "leader", "members"], req.query?.keyword),
          ],
        },
      },
      {
        $setWindowFields: { output: { totalCount: { $count: {} } } },
      },
      {
        $lookup: {
          from: "members",
          localField: "leader",
          foreignField: "_id",
          as: "leader",
        },
      },
      {
        $unwind: {
          path: "$leader",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          ...parseSortString(req.query?.sortString, "createdAt;-1"),
        },
      },
    ]);

    // return the members
    return res.status(200).json({
      message: "Members found",
      success: true,
      ministries: ministry,
      pageNumber: page,
      // for total number of pages we have a value called totalCount in the output field of the setWindowFields stage
      // we need to target one document in the output array, so we use the 0 index, and then access the totalCount property
      // if we don't have a totalCount, we return 0
      pages: Math.ceil(ministry.length > 0 ? ministry[0].totalCount / pageSize : 0),
      totalCount: ministry.length > 0 ? ministry[0].totalCount : 0,
      // pages: Math.ceil(count / pageSize),
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
