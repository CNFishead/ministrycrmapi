import CheckInRecord from '../models/CheckInRecord';

/**
 * This cron job will remove all check-in records that are older than 60 days.
 */
export default async function removeCheckInRecords() {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    await CheckInRecord.deleteMany({ checkInDate: { $lt: sixtyDaysAgo } });
    console.log('Check-in records older than 60 days removed successfully');
  } catch (error) {
    console.error('Error in removeCheckInRecords:', error);
  }
}
