import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import CheckInRecord from '../../modules/ministry/models/CheckInRecord'; 
import CheckInSummary from '../../modules/ministry/models/CheckInSummary';

/**
 * @description - allows developer to run a myriad of different functions on the platform via a http request
 *
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      console.log('🔄 Rebuilding all CheckInSummaries from CheckInRecords...');

      // Aggregate all records grouped by date, ministry, and locationType
      const checkIns = await CheckInRecord.aggregate([
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' } },
              ministryId: '$ministry',
              locationType: '$location',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: {
              date: '$_id.date',
              ministryId: '$_id.ministryId',
            },
            checkIns: {
              $push: {
                locationType: '$_id.locationType',
                count: '$count',
              },
            },
          },
        },
      ]);

      if (checkIns.length === 0) {
        console.log('✅ No records found to rebuild summaries.');
        return;
      }

      // Remove all existing summaries (optional, or you can overwrite with upsert)
      await CheckInSummary.deleteMany({});
      console.log('🗑 Existing summaries cleared.');

      for (const record of checkIns) {
        const checkInMap: Record<string, number> = {};

        for (const checkIn of record.checkIns) {
          checkInMap[`checkIns.${checkIn.locationType}`] = checkIn.count;
        }

        await CheckInSummary.updateOne(
          {
            date: new Date(record._id.date),
            ministry: record._id.ministryId,
          },
          {
            $set: {}, // clear old values if necessary
            $inc: checkInMap,
          },
          { upsert: true }
        );
      }

      console.log(`✅ Successfully rebuilt ${checkIns.length} CheckInSummary records.`);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res, next);
    }
  }
);
