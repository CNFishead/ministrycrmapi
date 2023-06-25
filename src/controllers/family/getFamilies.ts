import { NextFunction, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Family from "../../models/Family";

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
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query?.limit) || 10;
    const page = Number(req.query?.pageNumber) || 1;

    // create an object to hold the filter options
    // filterOptions will be an array of objects, seperated by a ';' and each object will be seperated by a ','
    // example: filterOptions = 'name;Austin,age;25'
    const filterOptionsObject: Record<string, any> = {};
    if (req.query?.filterOptions) {
      const filterOptionsArray = req.query.filterOptions.split(",");
      filterOptionsArray.forEach((filterOption: any) => {
        const [key, value] = filterOption.split(";");
        // we need to typecast the value to a number if it is a number
        // this is because the value will be a string
        // we also need to check for boolean values
        if (value === "true") {
          filterOptionsObject[key] = true;
        } else if (value === "false") {
          filterOptionsObject[key] = false;
        } else {
          filterOptionsObject[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });
    }

    /* sort */
    const sortObject: Record<string, any> = {};
    if (req.query?.sortOptions) {
      const [key, value]: any = req.query.sortOptions.split(";");
      sortObject[key] = value === "1" ? 1 : -1;
    } else {
      sortObject.displayDate = -1;
    }

    const families = await Family.aggregate([
      {
        $match: {
          user: req.user._id,
          $and: [
            ...(req.query?.keyword
              ? [
                  {
                    $or: [
                      {
                        name: {
                          $regex: req.query.keyword,
                          $options: "i",
                        },
                      },
                    ],
                  },
                ]
              : [{}]),
            ...(req.query?.filterOptions
              ? [
                  ...Object.keys(filterOptionsObject).map((key) => ({
                    [key]: filterOptionsObject[key],
                  })),
                ]
              : // $or cannot be empty, so we need to add a dummy object
                [{}]),
          ],
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $setWindowFields: { output: { totalCount: { $count: {} } } },
      },
      {
        $sort: {
          ...sortObject,
        },
      },
      {
        $skip: pageSize * (page - 1),
      },
      {
        $limit: pageSize,
      },
    ]);
    return res.json({
      families,
      page,
      // for total number of pages we have a value called totalCount in the output field of the setWindowFields stage
      // we need to target one document in the output array, so we use the 0 index, and then access the totalCount property
      // if we don't have a totalCount, we return 0
      pages: Math.ceil(families.length >= 1 ? families[0].totalCount / pageSize : 0),
      totalCount: families.length >= 1 ? families[0].totalCount : 0,
      // pages: Math.ceil(count / pageSize),
      prevPage: page - 1,
      nextPage: page + 1,
    });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
