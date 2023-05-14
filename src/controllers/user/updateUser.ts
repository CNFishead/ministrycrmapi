import asyncHandler from '../../middleware/asyncHandler';
import errorHandler from '../../middleware/error';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import User from '../../models/User';
import userObject from '../../utils/userObject';
/**
 * @description: This function updates the user object with the values sent from the client
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object that was updated
 * 
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-05-08T17:50:46.000-05:00
 * 
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    // we need to run the findByIdAndUpdate function to update the user object, we already have access to the user object from the protect middleware
    // we need to pass in the user id, the data to update, and the options object
    // we need to set the new option to true so that the updated user object is returned
    // we need to set the runValidators option to true so that the validator functions are run on the updated user object
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {...req.body},
      {
        new: true,
        runValidators: true
      }
    )
    // if the updatedUser object is null, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // if the updatedUser object is not null, return the updatedUser object, using the userObject method to remove the password field
    res.status(200).json({ success: true, user: await userObject(updatedUser._id) });
  } catch (error: any) {
    console.log(error);
    errorHandler(error, req, res, next);
  }
})