import cron from 'node-cron';
import aggregateCheckIns from './checkInSummaryJob';

export const cronJobs = async () => {
  // only init if not in development mode
  if (process.env.NODE_ENV === 'development') {
    console.warn('[CronJobs] Skipping cron job initialization in development mode');
    return;
  }
  console.info('[CronJobs] Initializing cron jobs...');
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
