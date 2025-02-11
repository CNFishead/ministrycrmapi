import moment from 'moment';
import CheckInRecord from '../models/CheckInRecord';
import CheckInSummary from '../models/CheckInSummary';

/**
 * @description This cron job is responsible for generating a summary of check-ins for the day, for all ministries that have check-ins.
 */
export default async function checkInSummaryJob() {
  try {
    // 1. Get all CheckInRecords for the day
    const records = await CheckInRecord.aggregate([
      {
        $match: {
          checkInDate: {
            $gte: moment().startOf('day').toDate(),
            $lt: moment().endOf('day').toDate(),
          },
        },
      },
      {
        $group: {
          _id: '$ministry',
          totalCheckIns: { $sum: 1 },
        },
      },
    ]);
    // 2. For each ministry, create a CheckInSummary record
    for (const record of records) {
      await CheckInSummary.create({
        date: moment().startOf('day').toDate(),
        ministry: record._id,
        totalCheckIns: record.totalCheckIns,
      });
    }
    console.log('Check-in summary job completed successfully');
  } catch (error) {
    console.error('Error in checkInSummaryJob:', error);
  }
}
