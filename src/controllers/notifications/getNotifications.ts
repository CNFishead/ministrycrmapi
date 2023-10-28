import { Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import errorHandler from "../../middleware/error";
import Notification from "../../models/Notification";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseSortString from "../../utils/parseSortString";

/**
 * @description - Returns a number of notifications for the user
 * @access      Private
 * @route       GET /api/notifications
 * @param       {number} limit - number of notifications to return
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit, sortOptions, filterOptions, keyword } = req.query!;

    const notifications = await Notification.aggregate([
      {
        $match: {
          userTo: req.user._id,
          ...parseFilterOptions(filterOptions),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userFrom",
          foreignField: "_id",
          as: "userFrom",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                profileImageUrl: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userTo",
          foreignField: "_id",
          as: "userTo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                profileImageUrl: 1,
                fullName: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$userFrom",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userTo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          ...parseSortString(sortOptions, "createdAt;-1"),
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.log(error);
    errorHandler(error, req, res);
  }
});
