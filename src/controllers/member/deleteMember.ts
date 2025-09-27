import asyncHandler from '../../middleware/asyncHandler';
import error from '../../middleware/error';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import Member from '../../models/Member';
import { Response } from 'express';
import Ministry, { IMinistry as MinistryType } from "../../modules/ministry/models/Ministry.model"; 
import CheckInRecord from '../../models/CheckInRecord';

export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberId } = req.params!;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(200).json({ message: 'No Member Found' });
    } else {
      // check if the member is a leader of any ministries, if they are,
      // we need to throw an error and tell the user that they cannot delete the member
      const ministries = await Ministry.aggregate([
        {
          $match: {
            leader: member._id,
          },
        },
      ]);
      if (ministries.length > 0) {
        return res
          .status(400)
          .json({ message: 'Cannot delete a member that is a leader of a ministry' });
      }

      // next we need to find any ministries that the member is a part of and remove them from the ministry
      // the members array is a collection of member ids, so we need to remove the member id from the array
      const _ministries = await Ministry.find({
        members: { $in: [memberId] },
      });

      for (const _m of _ministries) {
        _m.members = _m.members.filter((m) => m.toString() !== memberId);
        await _m.save();
      }

      // Next we want to query for all CheckInRecords that have been created by the member and delete them, they should remove themselves after
      // 60 days, but we want to make sure that they are deleted if the member is deleted.
      const records = await CheckInRecord.find({ member: memberId });
      await CheckInRecord.deleteMany({ _id: { $in: records.map((r) => r._id) } });

      // finally we want to delete the member from the database
      await Member.findByIdAndDelete(memberId);

      return res.status(200).json({ message: 'Member Deleted', success: true });
    }
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
