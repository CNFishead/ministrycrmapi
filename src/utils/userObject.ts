import { ObjectId } from "mongoose";
import User from "../models/User";

/**
 *  @description: This function finds a user in the database where we need to return a user object to the front
 *               a central function to keep the code clean and readable
 *  @param       {string} id: The id of the user we need to find
 *  @returns     {object} user: The user object we need to return to the front
 *  @throws:     If the user is not found or if the user is not active
 *
 */
export default async (id: string) => {
  try {
    User.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      {
        // find all the ministries that the user is a part of and populate the ministry object
        $lookup: {
          from: "ministry",
          localField: "_id",
          foreignField: "leader",
          as: "ministries",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          ministries: 1,
        },
      }
    ],
      function (err, user) {
        if (err) {
          console.log(err);
          throw new Error(err.message);
        }
        return user;
      }
    );
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
