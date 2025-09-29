import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import mongoose from "mongoose"; 
import parseQueryKeywords from "../../utils/parseQueryKeywords";
import parseFilterOptions from "../../utils/parseFilterOptions";
import parseSortString from "../../utils/parseSortString";
import FeatureSchema from "../../modules/auth/models/FeatureSchema";

/**
 * @description       Gets a collection of documents from the database
 * @route             GET /api/v1/family
 * @access            Public
 *
 * @param req         Request
 * @param res         Response
 * @param next        NextFunction
 *
 * @returns           { Object } { data: data, page: page, pages: pages, totalCount: totalCount, prevPage: prevPage, nextPage: nextPage }
 *
 * @author            Austin Howard
 * @version           1.0.3
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2024-11-03 20:58:20
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query?.limit) || 10;
    const page = Number(req.query?.pageNumber) || 1;
    // Generate the keyword query
    const keywordQuery = parseQueryKeywords(["name"], req.query?.keyword as string);

    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    const [data] = await FeatureSchema.aggregate([
      {
        $match: {
          $and: [
            ...parseFilterOptions(req.query?.filterOptions as string), // Apply user filter here
          ],
          ...(orConditions.length > 0 && { $or: orConditions }), // Only include `$or` if it has conditions
        },
      },
      {
        $sort: {
          ...parseSortString(req.query?.sortString as string, "createdAt;-1"),
        },
      },
      {
        $facet: {
          metadata: [
            { $count: "totalCount" }, // Count the total number of documents
            { $addFields: { page, pageSize } }, // Add metadata for the page and page size
          ],
          entries: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        },
      },
    ]);
    return res.json({
      payload: data.entries,
      page,
      pages: Math.ceil(data.metadata[0]?.totalCount / pageSize) || 0,
      totalCount: data.metadata[0]?.totalCount || 0,
      // pages: Math.ceil(count / pageSize),
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
