import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import errorHandler from '../../middleware/error';
import Notification from '../../models/Notification';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseSortString from '../../utils/parseSortString';
import parseQueryKeywords from '../../utils/parseQueryKeywords';

/**
 * @description - Returns a number of notifications for the user
 * @access      Private
 * @route       GET /api/notifications
 * @param       {number} limit - number of notifications to return
 *
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pageSize = Number(req.query?.limit) || 10;
      const page = Number(req.query?.pageNumber) || 1;
      // Generate the keyword query
      const keywordQuery = parseQueryKeywords(
        ['subject', 'description', 'notificationType'],
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

      const [data] = await Notification.aggregate([
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
                  from: 'users',
                  localField: 'userFrom',
                  foreignField: '_id',
                  as: 'userFrom',
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
                  from: 'users',
                  localField: 'userTo',
                  foreignField: '_id',
                  as: 'userTo',
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
                  path: '$userFrom',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $unwind: {
                  path: '$userTo',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        notifications: data.entries,
      });
    } catch (error) {
      console.log(error);
      errorHandler(error, req, res);
    }
  }
);
