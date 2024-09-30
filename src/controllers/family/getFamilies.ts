import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Family from "../../models/Family";
import mongoose from "mongoose";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseSortString from "../../utils/parseSortString";

/**
 * @description        Gets all families from the database, that belong to the account user
 * @route              GET /api/v1/family
 * @access             Private
 *
 * @param req          Request
 * @param res          Response
 * @param next         NextFunction
 *
 * @author             Austin Howard
 * @version            1.0.0
 * @since              1.0.0
 * @lastModifiedBy     Austin Howard
 * @lastModified       2023-06-18T15:33:33.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query?.limit) || 10;
    const page = Number(req.query?.pageNumber) || 1;
    const families = await Family.aggregate([
      {
        $match: {
          user: req.user?._id,
          $and: [{ ...parseFilterOptions(req.query?.filterOptions as string) }],
          $or: [
            ...parseQueryKeywords(["fullName", "email", "phoneNumber", "tags"], req.query?.keyword as string),
            { ...parseFilterOptions(req.query?.includeOptions as string) },
          ],
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
        $limit: pageSize,
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
    return res.json({
      families,
      page,
      // for total number of pages we have a value called totalCount in the output field of the setWindowFields stage
      // we need to target one document in the output array, so we use the 0 index, and then access the totalCount property
      // if we don't have a totalCount, we return 0
      pages: Math.ceil(families.length >= 1 ? families[0].totalCount / pageSize : 0),
      totalCount: families.length >= 1 ? families[0].totalCount : 0,
      // pages: Math.ceil(count / pageSize),
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
