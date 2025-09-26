import PartnerSchema from '../../../models/PartnerSchema';
import asyncHandler from '../../../middleware/asyncHandler';
import error from '../../../middleware/error'; 
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import { Response } from 'express';

/**
 * @description - Updates a member
 *
 * @param {string} memberId - the id of the member to be updated
 * @param {object} member - the member object to be updated
 *
 * @returns {object} - the updated member object
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2023-08-27T13:42:45.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.id)
      return res.status(400).json({ message: '_id is required', success: false });
    const partner = await PartnerSchema.findByIdAndUpdate(
      req.params.id,
      { ...req.body?.partner },
      { runValidators: true, new: true }
    );
    await partner?.save();
    if (!partner) return res.status(404).json({ message: 'Partner not found', success: false });
    return res.status(200).json({ message: 'Partner updated', success: true, payload: partner });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
