import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Family from '../../models/Family'; 
import User from '../../modules/auth/models/User';
import FeatureSchema from '../../modules/auth/models/FeatureSchema';

/**
 * @description       Removes object from database
 * @access            Private
 *
 * @returns           { Object } { success: true }
 * @author            Austin Howard
 * @version           1.0.0
 * @since             1.0.0
 * @lastModifiedBy    Austin Howard
 * @lastModified      2024-11-03 21:03:41
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await FeatureSchema.findById(req.params?.id);
      // check if it exists
      if (!data) {
        // return a 404 if it does not
        return res.status(404).json({
          success: false,
          message: `No feature found with the id of ${req.params?.id}`,
        });
      }

      // run an aggregation to see if there are any users with this feature, if there is throw an error
      const users = await User.aggregate([
        {
          $match: {
            features: {
              $in: [data._id],
            },
          },
        },
      ]);
      if (users.length > 0) {
        return res.status(401).json({
          success: false,
          message: 'Feature is in use by a user',
        });
      }

      // remove the family
      await FeatureSchema.findByIdAndDelete(req.params?.id);

      return res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log(e);
      error(e, req, res, next);
    }
  }
);
