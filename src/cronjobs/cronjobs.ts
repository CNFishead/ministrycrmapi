import cron from 'node-cron';
import aggregateCheckIns from './checkInSummaryJob';

export const cronJobs = async () => {
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('Running a job at 00:00 at America/Los_Angeles timezone');
      // creates a summary of check-ins for the day, for all ministries that have check-ins.
      await aggregateCheckIns();
    },
    {
      scheduled: true,
      timezone: 'America/Los_Angeles',
    }
  );
};
