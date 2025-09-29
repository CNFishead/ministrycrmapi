import mongoose from 'mongoose';
import asyncHandler from '../../../middleware/asyncHandler'; 
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import { Response } from 'express';
import error from '../../../middleware/error';
import PartnerSchema from '../../../models/PartnerSchema';
/**
 * @description - Returns information on a single user
 *
 * @param {string} memberId - the id of the member to be returned
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-10-29 13:06:19
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.id)
      return res.status(400).json({ message: 'Member ID is required', success: false });
    const [data] = await PartnerSchema.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) },
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
      return res.status(404).json({ message: 'Member not found', success: false });
    return res.status(200).json({ message: 'Member found', success: true, data: data.entries[0] });
  } catch (e) {
    console.log(e);
    error(e, req, res, next);
  }
});
