import asyncHandler from "../../middleware/asyncHandler";
import { Response } from "express";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseSortString from "../../utils/parseSortString";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Event from "../../models/Event";

/**
 * @description: This function returns paginated data in the system
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2024-08-28 09:27:08
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10, pageNumber = 1 } = req.query as any;

    const data = await Event.aggregate([
      {
        $match: {
          $and: [{ ...parseFilterOptions(req.query?.filterOptions as string) }],
          $or: [
            ...parseQueryKeywords(["name", "description"], req.query?.keyword as string),
            { ...parseFilterOptions(req.query?.includeOptions as string) },
          ],
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
        $skip: Number(limit) * (Number(pageNumber) - 1),
      },
      {
        $limit: Number(limit),
      },
      {
        $lookup: {
          from: "ministries",
          localField: "ministry",
          foreignField: "_id",
          as: "ministry",
        },
      },
      {
        $unwind: {
          path: "$ministry",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      payload: {
        data,
        pageNumber,
        pages: Math.ceil(data.length > 0 ? data[0].totalCount / (limit as any) : 0),
        totalCount: data.length > 0 ? data[0].totalCount : 0,
        // pages: Math.ceil(count / pageSize),
        prevPage: (pageNumber as any) - 1,
        nextPage: (pageNumber as any) + 1,
      },
    });
  } catch (e) {
    console.log(e);
    error(e, req, res);
  }
});
