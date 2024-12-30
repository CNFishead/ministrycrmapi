import asyncHandler from '../../middleware/asyncHandler';
import errorHandler from '../../middleware/error';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import LegalPages from '../../models/LegalPages';
/**
 * @description: This function updates an object in the database
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object that was updated
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2024-12-29 20:27:18
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const updatedItem = await LegalPages.findByIdAndUpdate(
      req.params?.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    // if the updatedUser object is not null, return the updatedUser object, using the userObject method to remove the password field
    return res.status(200).json({
      success: true,
    });
  } catch (error: any) {
    console.log(error);
    errorHandler(error, req, res, next);
  }
});
