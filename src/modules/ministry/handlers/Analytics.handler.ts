import { Request } from 'express';
import { ModelKey, ModelMap } from '../../../utils/ModelMap';
import { IMember } from '../models/Member.model';
import parseFilterOptions from '../../../utils/parseFilterOptions';
import parseQueryKeywords from '../../../utils/parseQueryKeywords';
import CheckInRecord from '../models/CheckInRecord';

export class AnalyticsHandler {
  private modelMap: Record<ModelKey, any> = ModelMap;

  public async memberCheckInData(req: Request): Promise<any> {
    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    const keywordQuery = parseQueryKeywords(['name', 'tags'], req.query?.keyword as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    const [data] = await this.modelMap['check-rec'].aggregate([
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

    console.log('[AnalyticsHandler] Check-in data retrieved:', data);
    return data.entries || [];
  }

  public async getGenderDistribution(members: IMember[]): Promise<any> {
    const result = await this.modelMap['member'].aggregate([
      {
        $match: { _id: { $in: members } },
      },
      {
        $group: {
          _id: '$sex',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('[AnalyticsHandler] Gender distribution retrieved:', result);
    return result;
  }
}
