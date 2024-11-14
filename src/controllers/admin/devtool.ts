import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import User from '../../models/User';
import Ministry from '../../models/Ministry';
import Family from '../../models/Family';
import Member from '../../models/Member';
import sendMailSparkPost from '../../utils/sendMailSparkPost';

/**
 * @description - allows developer to run a myriad of different functions on the platform via a http request
 *
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res, next);
    }
  }
);
