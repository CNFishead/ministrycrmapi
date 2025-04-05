import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { Response } from 'express';
import error from '../../middleware/error';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import CheckInRecord from '../../models/CheckInRecord';
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
    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    const keywordQuery = parseQueryKeywords(['name', 'tags'], req.query?.keyword as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    const [data] = await CheckInRecord.aggregate([
      {
        $match: {
          $and: [
            ...parseFilterOptions(req.query?.filterOptions as string), // Apply user filter here
          ],
          ...(orConditions.length > 0 && { $or: orConditions }), // Only include `$or` if it has conditions
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' } }, // Group by date (YYYY-MM-DD format)
            ministry: '$ministry', // Group by ministry
          },
          checkInCount: { $sum: 1 }, // Count check-ins per day per ministry
        },
      },
      {
        $lookup: {
          from: 'ministries', // Replace with your actual ministries collection name
          localField: '_id.ministry',
          foreignField: '_id',
          as: 'ministryInfo',
        },
      },
      {
        $unwind: '$ministryInfo', // Flatten the array result from $lookup
      },
      {
        $sort: { '_id.date': 1 }, // Sort by date ascending
      },
      {
        $group: {
          _id: '$_id.date',
          ministries: {
            $push: {
              ministry: '$_id.ministry',
              name: '$ministryInfo.name', // Assuming 'name' is the field in the ministries collection
              count: '$checkInCount',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          ministries: 1,
        },
      },
      // sort
      { $sort: { '_id.date': 1 } }, // Sort by date ascending
      {
        $facet: {
          metadata: [
            { $count: 'totalCount' }, // Count the total number of documents
          ],
          entries: [],
        },
      },
    ]);
    console.log(data);
    return res
      .status(200)
      .json({ message: 'Member found', success: true, payload: [...data.entries] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
