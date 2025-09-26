import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import asyncHandler from '../../../middleware/asyncHandler';
import User from '../../../modules/auth/models/User';
import error from '../../../middleware/error';

/**
 * @description - Updates a member
 * @returns {object} - the updated member object
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastModifiedBy Austin Howard
 * @lastModified 2024-12-16 13:48:15
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.params?.id)
      return res.status(400).json({ message: 'Member ID is required', success: false });
    const _m = await User.findByIdAndUpdate(
      req.params?.id,
      { ...req.body },
      { runValidators: true, new: true }
    );
    if (!_m) return res.status(404).json({ message: 'Member not found', success: false });
    await _m.save();
    return res.status(200).json({ message: 'Member updated', success: true });
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
