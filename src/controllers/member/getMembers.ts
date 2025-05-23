import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import Member from '../../models/Member';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import mongoose from 'mongoose';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseSortString from '../../utils/parseSortString';
import { parse } from 'path';

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
    // Generate the keyword query
    const keywordQuery = parseQueryKeywords(['name', 'tags'], req.query?.keyword as string);

    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    const [data] = await Member.aggregate([
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
                from: 'families',
                localField: 'family',
                foreignField: '_id',
                as: 'family',
              },
            },
            {
              $lookup: {
                from: 'ministries',
                let: { memberId: '$_id' }, // the ID of the user/member
                as: 'ministriesMemberOf', // result will be stored in this field
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          // Check if the memberId exists in the "members" array
                          { $in: ['$$memberId', '$members'] },
                          // Check if the user owns the ministry
                          { $eq: ['$user', req.user._id] },
                        ],
                      },
                    },
                  },
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
                from: 'ministries',
                localField: '_id',
                foreignField: 'leader',
                as: 'numberOfLeaderMinistries',
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
              $unwind: {
                path: '$family',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
    ]);

    // return the members
    return res.status(200).json({
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
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
