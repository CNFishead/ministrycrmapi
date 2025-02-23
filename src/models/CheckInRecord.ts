import mongoose, { Schema, Document } from 'mongoose';

export interface CheckInRecord extends Document {
  _id: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  ministry: mongoose.Types.ObjectId;
  location: string;
  processed: boolean;
  checkInDate: Date;
}

/**
 * @description - This schema is used to track check-ins for members in a ministry. This is short term data that will be used to track attendance, and is removed after a certain period of time.
 * @author Austin Howard
 * @since 1.0
 * @version 1.0
 * @lastModifiedBy - Austin Howard
 * @lastModified 2025-02-11 14:22:09
 */
const CheckInRecordSchema: Schema = new Schema({
  member: { type: Schema.Types.ObjectId, required: true, ref: 'Member' },
  ministry: { type: Schema.Types.ObjectId, required: true, ref: 'Ministry' },
  checkInDate: { type: Date, default: Date.now },
  location: { type: String, required: true, enum: ['in-person', 'online', 'event'] }, // Location where the check-in occurred, e.g., 'Online', 'Church', 'Event'
  processed: { type: Boolean, default: false }, // Flag to indicate if the check-in has been processed, to avoid double counting and multiple queries
});

export default mongoose.model<CheckInRecord>('Check', CheckInRecordSchema);
