import asyncHandler from "../../middleware/asyncHandler";
import User from "../../models/User";
import { Response, Request } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
/**
 * @description: This function will return the full user details to the front
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-04-30T15:26:22.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(200).json({ message: "No User Found, token failed" });
    } else {
      if (user.isActive === false) {
        return res.status(200).json({ message: "Not authorized, token failed" });
      }
      return res.status(200).json({ user: user });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: `Something Went Wrong: ${error.message}` });
  }
});
