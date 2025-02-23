import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import Ministry from '../../models/Ministry';
import CheckInRecord from '../../models/CheckInRecord';
import mongoose from 'mongoose';
import CheckInSummary from '../../models/CheckInSummary';
import Member from '../../models/Member';

/**
 * @description - allows developer to run a myriad of different functions on the platform via a http request
 *
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const members = await Member.find({
        user: new mongoose.Types.ObjectId(`674502107f2646bb882d5674`),
      });

      if (!members) {
        return res.status(404).json({ message: 'Members not found', success: false });
      }
      const ministryMain = await Ministry.findOne({
        _id: new mongoose.Types.ObjectId(`674502127f2646bb882d5679`),
      });

      if (!ministryMain) {
        return res.status(404).json({ message: 'Ministry not found', success: false });
      }

      for (const member of members) {
        // check if the member already exists in the ministry.members
        // if not, add them
        if (!ministryMain.members.includes(member._id as any)) {
          console.log(`member ${member._id} not found in ministry ${ministryMain._id}`);
          ministryMain.members.push(member._id as any);
        }
        await ministryMain.save();
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res, next);
    }
  }
);
