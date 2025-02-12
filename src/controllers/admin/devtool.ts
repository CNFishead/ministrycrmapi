import { NextFunction, Response } from 'express';
import asyncHandler from '../../middleware/asyncHandler';
import { AuthenticatedRequest } from '../../types/AuthenticatedRequest';
import error from '../../middleware/error';
import Ministry from '../../models/Ministry';
import CheckInRecord from '../../models/CheckInRecord';
import mongoose from 'mongoose';
import CheckInSummary from '../../models/CheckInSummary';

/**
 * @description - allows developer to run a myriad of different functions on the platform via a http request
 *
 */
export default asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('Running daily check-in aggregation...');

      // Find all check-ins that haven't been processed yet
      const checkIns = await CheckInRecord.aggregate([
        {
          $match: { processed: false }, // Only new check-ins
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' } }, // Group by date
              ministryId: '$ministry',
            },
            totalCheckIns: { $sum: 1 },
            records: { $push: '$_id' }, // Collect record IDs
          },
        },
      ]);

      console.log(checkIns);

      if (checkIns.length === 0) {
        console.log('✅ No new check-ins to process.');
        return;
      }
      // Upsert into CheckInSummary
      for (const record of checkIns) {
        await CheckInSummary.updateOne(
          { date: new Date(record._id.date), ministry: record._id.ministryId },
          { $set: { totalCheckIns: record.totalCheckIns } },
          { upsert: true }
        );
      }

      console.log('Aggregation complete. Cleaning up old check-in records...');
      // Collect processed record IDs
      const processedIds = checkIns.flatMap((record) => record.records);

      if (processedIds.length > 0) {
        await CheckInRecord.bulkWrite(
          processedIds.map((id) => ({
            updateOne: {
              filter: { _id: id },
              update: { $set: { processed: true } },
            },
          }))
        );
        console.log(`✅ Marked ${processedIds.length} check-ins as processed.`);
      }

      // Optional: Delete processed check-ins from CheckInRecords that are older than 60 days
      await CheckInRecord.deleteMany({
        checkInDate: { $lt: new Date(new Date().setDate(new Date().getDate() - 60)) },
        processed: true,
      });

      console.log('Old check-ins deleted successfully.');

      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      error(err, req, res, next);
    }
  }
);
