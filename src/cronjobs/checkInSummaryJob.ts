import mongoose from 'mongoose';
import CheckInSummary from '../modules/ministry/models/CheckInSummary';
import CheckInRecord from '../modules/ministry/models/CheckInRecord';

export default async function aggregateCheckIns() {
  try {
    console.log('Running daily check-in aggregation...');

    // Find all check-ins that haven't been processed yet
    const checkIns = await CheckInRecord.aggregate([
      {
        $match: { processed: false },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$checkInDate' } },
            ministryId: '$ministry',
            locationType: '$location', // ✅ Correct field name
          },
          checkInCount: { $sum: 1 }, // ✅ This now matches below
          records: { $push: '$_id' },
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
              count: '$checkInCount', // ✅ Fixed
            },
          },
          records: { $push: '$records' },
        },
      },
    ]);

    if (checkIns.length === 0) {
      console.log('✅ No new check-ins to process.');
      return;
    }
    // Upsert into CheckInSummary
    for (const record of checkIns) {
      // Convert checkIns array into a key-value object dynamically
      const checkInMap: Record<string, number> = {};
      for (const checkIn of record.checkIns) {
        const locationType = checkIn.locationType || 'unknown'; // Fallback to 'unknown' if locationType is not defined
        checkInMap[`checkIns.${checkIn.locationType}`] = checkIn.count;
      }

      await CheckInSummary.updateOne(
        { date: new Date(record._id.date), ministry: record._id.ministryId },
        { $inc: checkInMap }, // Dynamically update only the locations present
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

    // Delete processed check-ins from CheckInRecords that are older than 60 days
    await CheckInRecord.deleteMany({
      checkInDate: { $lt: new Date(new Date().setDate(new Date().getDate() - 60)) },
      processed: true,
    });

    console.log('Old check-ins deleted successfully.');
  } catch (error) {
    console.error('Error in check-in aggregation:', error);
  }
}
