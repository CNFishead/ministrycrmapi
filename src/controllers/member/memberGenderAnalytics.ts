import mongoose from 'mongoose';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import { Response } from 'express';
import error from '../../middleware/error';  
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseSortString from '../../utils/parseSortString';
import MinistryModel from '../../modules/ministry/models/Ministry.model';
import MemberModel from '../../modules/ministry/models/Member.model';

/**
 * @description - Returns information about a ministry's gender analytics, i.e. the number of males and females in the ministry
 *
 * @param {string}
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-10-29 13:06:19
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // Generate the keyword query
    const keywordQuery = parseQueryKeywords(['name', 'tags'], req.query?.keyword as string);

    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    // search for the ministry in question
    const [data] = await MinistryModel.aggregate([
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
    ]);
    if (!data) return res.status(404).json({ message: 'Ministry not found', success: false });

    // use the data to find all members in the ministry, group them together by gender and count them
    const members = await MemberModel.aggregate([
      {
        $match: { _id: { $in: data.members } },
      },
      {
        $group: {
          _id: '$sex',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ success: true, payload: members });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
