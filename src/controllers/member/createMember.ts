import asyncHandler from "../../middleware/asyncHandler";
import User from "../../models/User";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import error from "../../middleware/error";
import Ministry from "../../models/Ministry";
import Member from "../../models/Member";
/**
 * @description: This function will create a new member for the ministry.
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-06-04T20:33:51.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // find the ministry that we want to add the member to.
    const member = await Member.create({ ...req.body});
    if (!member) return res.status(400).json({ message: "Unable to create Member", success: false });
    return res.status(201).json({ message: "Member created", success: true, data: member });
  } catch (e: any) {
    console.log(e);
    error(e, req, res, next);
  }
});
