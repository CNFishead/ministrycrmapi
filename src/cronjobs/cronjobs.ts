import cron from 'node-cron';
import checkInSummaryJob from './checkInSummaryJob';
import removeCheckInRecords from './removeCheckInRecords';
export const cronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running a job at 00:00 at America/Los_Angeles timezone');

    // creates a summary of check-ins for the day, for all ministries that have check-ins.
    await checkInSummaryJob();

    // removes all check-in records that are older than 60 days.
    await removeCheckInRecords();
  });
};
