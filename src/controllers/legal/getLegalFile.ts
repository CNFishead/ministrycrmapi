import asyncHandler from '../../middleware/asyncHandler';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import mongoose from 'mongoose';
import error from '../../middleware/error';
import LegalPages from '../../models/LegalPages';
/**
 * @description: This function returns a single document from the database
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2024-12-29 20:21:42
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [data] = await LegalPages.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
        },
      },
    ]);
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    return res.json({
      success: true,
      payload: {
        ...data,
      },
    });
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
