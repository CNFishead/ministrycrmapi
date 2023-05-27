import mongoose, { ObjectId } from "mongoose";
import User from "../models/User";
import generateToken from "./generateToken";

/**
 *  @description: This function finds a user in the database where we need to return a user object to the front
 *               a central function to keep the code clean and readable
 *  @param       {string} id: The id of the user we need to find
 *  @returns     {object} user: The user object we need to return to the front
 *  @throws:     If the user is not found or if the user is not active
 *
 */
export default async (id: any) => { 
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      // use the id of the user to find the ministry that the user is a leader of
      {
        $lookup: {
          from: "ministries",
          localField: "_id",
          foreignField: "leader",
          as: "ministry",
          pipeline: [
            {
              $lookup:{
                from: "users",
                localField: "leader",
                foreignField: "_id",
                as: "leader",
              }
            },
            {
              $unwind: {
                path: "$leader",
                preserveNullAndEmptyArrays: true,
            }
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$ministry",
          preserveNullAndEmptyArrays: true,
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          ministry: 1,
          role:1,
          profileImageUrl: 1,
        },
      }
    ]);
    console.log(user[0])
    if (!user[0]) {
      throw new Error("User not found");
    }
    return {
      ...user[0],
      token: generateToken(user[0]._id),
    };
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
};
