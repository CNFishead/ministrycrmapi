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
    const page = Number(req.query?.pageNumber as string) || 1;
    const ministryId = req.params?.ministryId as string;
    if (!ministryId) return res.status(400).json({ message: "Ministry ID is required", success: false });
    // find the members we are searching for, through the ministry thats passed in
    const members = await Member.aggregate([
      {
        $match: {
          mainMinistry: new mongoose.Types.ObjectId(ministryId),
          $and: [{ ...parseFilterOptions(req.query?.filterOptions as string) }],
          $or: [...parseQueryKeywords(["fullName", "email", "phoneNumber", "tags"], req.query?.keyword as string)],
        },
      },
      {
        $setWindowFields: { output: { totalCount: { $count: {} } } },
      },
      {
        $skip: (page - 1) * pageSize,
      },
      {
        $sort: {
          ...parseSortString(req.query?.sortString as string, "createdAt;-1"),
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
        $lookup: {
          // look for all the ministries that this member is a part of
          from: "ministries",
          localField: "_id",
          foreignField: "members",
          as: "numberOfMinistries",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          // find all ministries that this member is a leader of
          from: "ministries",
          localField: "_id",
          foreignField: "leader",
          as: "numberOfLeaderMinistries",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
    ]);

    // return the members
    return res.status(200).json({
      message: "Members found",
      success: true,
      members,
      pageNumber: page,
      // for total number of pages we have a value called totalCount in the output field of the setWindowFields stage
      // we need to target one document in the output array, so we use the 0 index, and then access the totalCount property
      // if we don't have a totalCount, we return 0
      pages: Math.ceil(members.length > 0 ? members[0].totalCount / pageSize : 0),
      totalCount: members.length > 0 ? members[0].totalCount : 0,
      // pages: Math.ceil(count / pageSize),
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
