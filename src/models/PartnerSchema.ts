import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PartnerType extends Document {}

const PartnerSchema: Schema = new Schema(
  {
    businessName: { type: String, required: true },
    partnerLogo: { type: String },
    partnerURL: { type: String },
    email: { type: String },
    phone: { type: String },

    isActive: { type: Boolean, default: true },

    partnerShare: {
      type: Number,
      default: 0.1, // 10% rev share unless otherwise noted
    },

    bypassBilling: {
      type: Boolean,
      default: false, // allows partner to waive billing
    },

    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    notes: {
      type: String,
      default: '',
    },

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<PartnerType>('Partner', PartnerSchema);
