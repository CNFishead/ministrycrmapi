import { Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import Member from "../../models/Member";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import mongoose from "mongoose";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseSortString from "../../utils/parseSortString";

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
    const ministryId = req.params?.ministryId;
    if (!ministryId) return res.status(400).json({ message: "Ministry ID is required", success: false });
    // find the members we are searching for, through the ministry thats passed in
    const members = await Member.aggregate([
      {
        $match: {
          ministry: new mongoose.Types.ObjectId(ministryId),
          ...parseFilterOptions(req.query?.filterOptions),
          $or: [...parseQueryKeywords(["fullName", "email", "phoneNumber", "tags"], req.query?.keyword)],
        },
      },
      {
        $lookup: {
          from: "families",
          localField: "family",
          foreignField: "_id",
          as: "family",
        },
      },
      {
        $unwind: {
          path: "$family",
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
    return res.status(200).json({ message: "Members found", success: true, data: members });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
