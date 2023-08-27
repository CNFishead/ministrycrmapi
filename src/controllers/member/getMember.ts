import mongoose from "mongoose";
import asyncHandler from "../../middleware/asyncHandler";
import Member from "../../models/Member";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import error from "../../middleware/error";

/**
 * @description - Returns information on a single user
 *
 * @param {string} memberId - the id of the member to be returned
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-08-27T13:42:45.000-05:00
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.memberId) return res.status(400).json({ message: "Member ID is required", success: false });
    const member = await Member.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.memberId),
        },
      },
    ]);

    if (!member[0]) return res.status(404).json({ message: "Member not found", success: false });
    return res.status(200).json({ message: "Member found", success: true, data: member[0] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
