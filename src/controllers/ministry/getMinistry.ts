import asyncHandler from "../../middleware/asyncHandler";
import User from "../../models/User";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import Ministry from "../../models/Ministry";
import mongoose from "mongoose";
/**
 * @description: This function returns the result of a ministry object to the frontend
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-05-20T17:30:05.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ministry = await Ministry.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "leader",
          foreignField: "_id",
          as: "leader",
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
        $unwind: {
          path: "$leader",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    console.log(`Ministry: `);
    console.log(ministry);

    // if the leader object is null, check try to find the leader object through the user model
    if (!ministry[0].leader) {
      console.log("Leader is null");
      const ministryLeader = await Ministry.findById(req.params?.id);
      const leader = await User.findById(ministryLeader?.leader);
      ministry[0].leader = leader;
      console.log(`Leader: ${leader}`);
      console.log(`Ministry: ${ministry}`);
    }
    if (!ministry[0]) {
      console.log(ministry);
      return res.status(404).json({ message: "Ministry not found" });
    }
    return res.json({
      success: true,
      ministry: { ...ministry[0] },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });
  }
});
