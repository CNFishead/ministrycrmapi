import asyncHandler from '../../middleware/asyncHandler';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import CheckInSummary from '../../models/CheckInSummary';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseFilterOptions from '../../utils/parseFilterOptions';
/**
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2025-02-16 10:36:05
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    const keywordQuery = parseQueryKeywords([], req.query?.keyword as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    console.log(...parseFilterOptions(req.query?.filterOptions as string));
    const [data] = await CheckInSummary.aggregate([
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
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, // Group by date (YYYY-MM-DD format)
          },
          count: { $sum: '$totalCheckIns' }, // Sum all check-ins for the date
        },
      },
      {
        $sort: { '_id.date': 1 }, // Sort by date ASC
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          count: 1,
        },
      },
      {
        $facet: {
          metadata: [
            { $count: 'totalCount' }, // Count the total number of documents
          ],
          entries: [],
        },
      },
    ]);
    return res.status(200).json({ success: true, payload: [...data.entries] });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });
  }
});
