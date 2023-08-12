import { Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import Member from "../../models/Member";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import mongoose from "mongoose";

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
    const page = Number(req.query?.pageNumber) || 1;
    const ministryId = req.params?.ministryId;
    // create an object to hold the filter options
    // filterOptions will be an array of objects, seperated by a ';' and each object will be seperated by a ','
    // example: filterOptions = 'name;Austin,age;25'
    const filterOptionsObject = {} as any;
    if (req.query?.filterOptions) {
      const filterOptionsArray = req.query?.filterOptions.split(",");
      filterOptionsArray.forEach((filterOption: string) => {
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
    const sortObject = {} as any;
    if (req.query?.sortOptions) {
      const [key, value] = req.query?.sortOptions.split(";");
      sortObject[key] = value === "1" ? 1 : -1;
    } else {
      sortObject.displayDate = -1;
    }
    if (!ministryId) return res.status(400).json({ message: "Ministry ID is required", success: false });
    // find the members we are searching for, through the ministry thats passed in
    const members = await Member.aggregate([
      {
        $match: {
          ministry: new mongoose.Types.ObjectId(ministryId),
          $and: [
            ...(req.query?.keyword
              ? [
                  {
                    $or: [
                      {
                        fullName: {
                          $regex: req.query?.keyword,
                          $options: "i",
                        },
                      },
                      {
                        videoDescription: {
                          $regex: req.query?.keyword,
                          $options: "i",
                        },
                      },
                      {
                        "cata.name": {
                          $regex: req.query?.keyword,
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
          from: "families",
          localField: "family",
          foreignField: "_id",
          as: "family",
        },
      },
      {
        $unwind: {
          path: "$family",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    // return the members
    return res.status(200).json({ message: "Members found", success: true, data: members });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
