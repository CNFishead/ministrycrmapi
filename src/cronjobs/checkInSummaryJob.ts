import mongoose from 'mongoose';
import CheckInSummary from '../models/CheckInSummary';
import CheckInRecord from '../models/CheckInRecord';

export default async function aggregateCheckIns() {
  try {
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
  } catch (error) {
    console.error('Error in check-in aggregation:', error);
  }
}

// Run the function
aggregateCheckIns()
  .then(() => mongoose.connection.close()) // Close DB connection after execution
  .catch(console.error);
