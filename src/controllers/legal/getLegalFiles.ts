import { Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import parseFilterOptions from '../../utils/parseFilterOptions';
import parseQueryKeywords from '../../utils/parseQueryKeywords';
import parseSortString from '../../utils/parseSortString'; 
import LegalPages from '../../models/LegalPages';

/**
 * @description - This function will return data for a collection
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object[]} members: The members of the ministry
 *
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModifiedBy - Austin Howard
 * @lastModified - 2024-12-29 20:20:41
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const pageSize = Number(req.query?.limit) || 10;
    const page = Number(req.query?.pageNumber) || 1;
    // Generate the keyword query
    const keywordQuery = parseQueryKeywords(['name'], req.query?.keyword as string);

    // Generate the filter options for inclusion if provided
    const filterIncludeOptions = parseFilterOptions(req.query?.includeOptions as string);

    // Construct the `$or` array conditionally
    const orConditions = [
      ...(Object.keys(keywordQuery[0]).length > 0 ? keywordQuery : []),
      ...(Object.keys(filterIncludeOptions[0]).length > 0 ? filterIncludeOptions : []), // Only include if there are filters
    ];

    const [data] = await LegalPages.aggregate([
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
          entries: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        },
      },
    ]);
    // return the members
    return res.json({
      success: true,
      payload: [...data.entries],
      metadata: {
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
