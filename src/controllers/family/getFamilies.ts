import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Family from '../../models/Family';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseSortString from '../../utils/parseSortString';

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
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const pageSize = Number(req.query?.limit) || 10;
      const page = Number(req.query?.pageNumber) || 1;
      // Generate the keyword query
      const keywordQuery = parseQueryKeywords(['name', 'tags'], req.query?.keyword as string);

      // Generate the filter options for inclusion if provided
      const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

      // Construct the `$or` array conditionally
      const orConditions = [
        ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
        ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
      ];
      const [data] = await Family.aggregate([
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
            ...parseSortString(req.query?.sortString as string, 'createdAt;-1'),
          },
        },
        {
          $facet: {
            metadata: [
              { $count: 'totalCount' }, // Count the total number of documents
              { $addFields: { page, pageSize } }, // Add metadata for the page and page size
            ],
            entries: [
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
              // any lookups necessary..
              {
                $lookup: {
                  // lookup from the members collection all users who have a family id that matches the family id in the family collection
                  from: 'members',
                  localField: 'members',
                  foreignField: '_id',
                  as: 'members',
                  pipeline: [
                    { $project: { fullName: 1, email: 1, phone: 1, profileImageUrl: 1 } }, // Project only necessary fields
                    { $sort: { fullName: 1 } }, // Sort the members by first name
                  ],
                },
              },
            ],
          },
        },
      ]);
      return res.json({
        payload: [...data.entries],
        pagination: {
          page,
          pages: Math.ceil(data.metadata[0]?.totalCount / pageSize) || 0,
          totalCount: data.metadata[0]?.totalCount || 0,
          // pages: Math.ceil(count / pageSize),
          prevPage: page - 1,
          nextPage: page + 1,
        },
      });
    } catch (err) {
      console.log(err);
      error(err, req, res, next);
    }
  }
);
