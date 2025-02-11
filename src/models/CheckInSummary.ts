import mongoose, { Schema, Document } from 'mongoose';

export interface CheckInSummary extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date; // date of the summary check-in
  ministry: mongoose.Types.ObjectId; // ministry the check-in is for
  totalCheckIns: number; // total number of check-ins for the day
}

/**
 * @description - This schema is used to track check-ins for members in a ministry. This is short term data that will be used to track attendance, and is removed after a certain period of time.
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModifiedBy - Austin Howard
 * @lastModified 2025-02-11 14:22:09
 */
const CheckInSummarySchema: Schema = new Schema({
  date: { type: Date, required: true },
  ministry: { type: Schema.Types.ObjectId, required: true, ref: 'Ministry' },
  totalCheckIns: { type: Number, required: true },
});

export default mongoose.model<CheckInSummary>('CheckSummary', CheckInSummarySchema);
