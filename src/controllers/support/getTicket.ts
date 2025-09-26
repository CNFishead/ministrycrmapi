import asyncHandler from '../../middleware/asyncHandler';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest'; 
import mongoose from 'mongoose';
import Support from '../../models/Support';
import error from '../../middleware/error';
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
    const [data] = await Support.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params?.id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'requester',
          foreignField: '_id',
          as: 'requester',
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                phoneNumber: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'supportgroups',
          localField: 'groups',
          foreignField: '_id',
          as: 'groups',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: '$requester', preserveNullAndEmptyArrays: true },
      },
    ]);
    if (!data) {
      return res.status(404).json({ message: 'Ministry not found' });
    }
    return res.json({
      success: true,
      payload: {
        data,
      },
    });
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
