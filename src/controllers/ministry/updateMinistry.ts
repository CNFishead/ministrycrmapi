import asyncHandler from "../../middleware/asyncHandler";
import errorHandler from "../../middleware/error";
import { Response } from "express";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import User from "../../models/User";
import userObject from "../../utils/userObject";
import Ministry from "../../models/Ministry";
/**
 * @description: This function updates the ministry object in the database
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object that was updated
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-05-20T18:31:22.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    console.log(req.body);
    const updatedMinistry = await Ministry.findByIdAndUpdate(
      req.params?.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    // if the updatedUser object is null, return a 404 error
    if (!updatedMinistry) {
      return res.status(404).json({ message: "User not found" });
    }
    // if the updatedUser object is not null, return the updatedUser object, using the userObject method to remove the password field
    res.status(200).json({
      success: true,
      ministry: updatedMinistry,
      message: `Ministry ${updatedMinistry.name} was successfully updated`,
    });
  } catch (error: any) {
    console.log(error);
    errorHandler(error, req, res, next);
  }
});
