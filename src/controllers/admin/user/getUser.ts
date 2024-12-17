import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import asyncHandler from '../../../middleware/asyncHandler';
import User from '../../../models/User';
import error from '../../../middleware/error';
/**
 * @description - Returns information on a single user
 *
 * @param {string} id - the id of the member to be returned
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-12-16 13:40:41
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.id)
      return res.status(400).json({ message: 'Member ID is required', success: false });
    const [data] = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.params.id) },
      },
      {
        $facet: {
          metadata: [
            { $count: 'totalCount' }, // Count the total number of documents
          ],
          entries: [],
        },
      },
    ]);
    if (!data.entries[0])
      return res.status(404).json({ message: 'User not found', success: false });

    return res.status(200).json({ message: 'User found', success: true, payload: data.entries[0] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
