import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import mongoose from 'mongoose';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseSortString from '../../utils/parseSortString';
import Ministry from '../../models/Ministry';
import User from '../../models/User';
import SupportGroup from '../../models/SupportGroups';
import Support from '../../models/Support';

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
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: any) => {
    try {
      const pageSize = Number(req.query?.limit) || 10;
      const page = Number(req.query?.pageNumber) || 1;
      // Generate the keyword query
      const keywordQuery = parseQueryKeywords(
        ['subject', 'description'],
        req.query?.keyword as string
      );

      // Generate the filter options for inclusion if provided
      const filterIncludeOptions = parseFilterOptions(
        req.query?.includeOptions as string
      );

      // Construct the `$or` array conditionally
      const orConditions = [
        ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
        ...(Object.keys(filterIncludeOptions[0]).length > 0
          ? filterIncludeOptions
          : []), // Only include if there are filters
      ];

      const [data] = await Support.aggregate([
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
              {
                $lookup: {
                  from: 'supportgroups',
                  localField: 'groups',
                  foreignField: '_id',
                  as: 'groups',
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        _id: 1,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);
      // return the members
      return res.json({
        success: true,
        payload: {
          data: data.entries,
          page,
          pages: Math.ceil(data.metadata[0]?.totalCount / pageSize) || 0,
          totalCount: data.metadata[0]?.totalCount || 0,
          // pages: Math.ceil(count / pageSize),
          prevPage: page - 1,
          nextPage: page + 1,
        },
      });
    } catch (e) {
      console.log(e);
      error(e, req, res, next);
    }
  }
);
