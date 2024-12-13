import { Response } from 'express';
import asyncHandler from '../../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import error from '../../../middleware/error';
import SupportGroup from '../../../models/SupportGroups';

/**
 * @description - Creates a new ticket
 *
 * @returns {object} - A success message and boolean
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastUpdatedBy Austin Howard
 * @lastUpdated 2024-08-14 08:21:29
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const group = await SupportGroup.create({
        ...req.body,
      });
      if (!group) {
        return res.status(400).json({
          message: 'Failed to create group',
          success: false,
        });
      }
      return res.status(201).json({
        message: 'Successful creation',
        success: true,
      });
    } catch (err) {
      console.log(err);
      error(err, req, res);
    }
  }
);
