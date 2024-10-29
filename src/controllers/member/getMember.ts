import mongoose from "mongoose";
import asyncHandler from "../../middleware/asyncHandler";
import Member from "../../models/Member";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import error from "../../middleware/error"; 
/**
 * @description - Returns information on a single user
 *
 * @param {string} memberId - the id of the member to be returned
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-10-29 13:06:19
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.memberId) return res.status(400).json({ message: "Member ID is required", success: false });
    const [data] = await Member.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.memberId) },
      },
      {
        $facet: {
          metadata: [
            { $count: "totalCount" }, // Count the total number of documents
          ],
          entries: [
            {
              $lookup: {
                from: "families",
                let: { memberId: "$_id" }, // the ID of the user/member
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$$memberId", "$members"],
                      },
                    },
                  },
                ],
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
                from: "ministries",
                let: { memberId: "$_id" }, // assuming "$_id" is the user's ID in the current collection
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $in: ["$$memberId", "$members"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      // Add other ministry fields you may need here
                    },
                  },
                ],
                as: "ministries",
              },
            },
          ],
        },
      },
    ]);
    if (!data.entries[0]) return res.status(404).json({ message: "Member not found", success: false });
    return res.status(200).json({ message: "Member found", success: true, data: data.entries[0] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
