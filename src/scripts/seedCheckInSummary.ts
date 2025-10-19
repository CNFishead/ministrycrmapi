import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CheckInSummary from '../modules/ministry/models/CheckInSummary';
import db from '../config/db';

dotenv.config();

const MINISTRY_ID = '6737fba9241afa1cb0216463';

/**
 * Generate random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seed CheckInSummary data for the last 4 months
 */
async function seedCheckInSummary() {
  try {
    await db();
    console.log('Connected to database');

    // Delete existing check-in summaries for this ministry
    const deleteResult = await CheckInSummary.deleteMany({ ministry: MINISTRY_ID });
    console.log(`Deleted ${deleteResult.deletedCount} existing check-in summaries`);

    // Calculate date range (last 4 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 4);

    console.log(`Generating data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const summaries = [];
    const currentDate = new Date(startDate);

    // Generate data for each day in the range
    while (currentDate <= endDate) {
      const inPersonCount = randomInt(1, 100);
      const onlineCount = randomInt(1, 100);
      const eventCount = randomInt(1, 100);

      const checkIns = new Map<string, number>([
        ['in-person', inPersonCount],
        ['online', onlineCount],
        ['event', eventCount],
      ]);

      summaries.push({
        date: new Date(currentDate),
        ministry: new mongoose.Types.ObjectId(MINISTRY_ID),
        checkIns,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Creating ${summaries.length} check-in summary documents...`);

    // Insert all summaries
    const result = await CheckInSummary.insertMany(summaries);
    console.log(`✅ Successfully created ${result.length} check-in summaries`);

    // Show sample data
    console.log('\nSample data (first 5 entries):');
    result.slice(0, 5).forEach((doc) => {
      console.log({
        date: doc.date.toISOString().split('T')[0],
        ministry: doc.ministry,
        checkIns: Object.fromEntries(doc.checkIns),
      });
    });

    // Calculate totals
    const totalInPerson = summaries.reduce((sum, s) => sum + (s.checkIns.get('in-person') || 0), 0);
    const totalOnline = summaries.reduce((sum, s) => sum + (s.checkIns.get('online') || 0), 0);
    const totalEvent = summaries.reduce((sum, s) => sum + (s.checkIns.get('event') || 0), 0);

    console.log('\n📊 Summary Statistics:');
    console.log(`Total Days: ${summaries.length}`);
    console.log(`Total In-Person Check-ins: ${totalInPerson}`);
    console.log(`Total Online Check-ins: ${totalOnline}`);
    console.log(`Total Event Check-ins: ${totalEvent}`);
    console.log(`Grand Total: ${totalInPerson + totalOnline + totalEvent}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding check-in summaries:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCheckInSummary();
