import errorHandler from '../../../middleware/error';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import asyncHandler from '../../../middleware/asyncHandler';
import { Response } from 'express';
import SupportGroup from '../../../models/SupportGroups';

/**
 * @description - Removes a document from the database
 *
 * @returns {object} - A success message and boolean
 *
 * @author Austin Howard
 * @since 1.0.0
 * @version 1.0.0
 * @lastUpdatedBy Austin Howard
 * @lastUpdated 2024-08-28 09:32:22
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const item = await SupportGroup.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: 'Group not found',
          success: false,
        });
      }

      // set the group isActive to false, we dont want to delete the group as it may be referenced elsewhere
      item.isActive = false;
      await item.save();

      return res.status(201).json({
        message: 'Successful Removal',
        success: true,
      });
    } catch (error) {
      console.log(error);
      errorHandler(error, req, res);
    }
  }
);
