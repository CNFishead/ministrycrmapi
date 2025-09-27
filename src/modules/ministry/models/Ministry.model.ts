import mongoose from 'mongoose';

export interface IMinistry extends mongoose.Document {
  _id: string;
  user: string;
  name: string;
  description: string;
  donationLink: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ministryType: string;
  leader: string;
  ministryImageUrl: string;
  members: string[];
  events: string[];
  announcements: string[];
  features: string[];
  payor: string;
  isPaidAccount: boolean;
  nextPayment: Date;
  initialPayment: Date;
  ownerMinistry: string;
  isMainMinistry: boolean;
  createdAt: Date;
  updatedAt: Date;
  isSubMinistry: boolean;
}

/**
 * @description - This schema defines the ministry object in the database, this is used to store all information pertaining to a ministry
 * @param {String} name - The name of the ministry
 * @param {String} description - The description of the ministry
 * @param {String} ministryImageUrl - The image url of the ministry
 * @param {String} ministryType - The type of ministry
 * @param {User} leader - The leader of the ministry, this is a reference to the user object in the database
 * @param {User[]} members - The members of the ministry, each member is a reference to a user object in the database, each member can have a different role
 * @param {Array} events - The events of the ministry
 * @param {Array} announcements - The announcements of the ministry
 * @param {Array} subMinistries - The classes of the ministry, i.e. bible study, sunday school, etc. each sub ministry is a reference to a ministry object in the database
 *                                so each sub ministry can have its own members, events, announcements, etc.
 * @param {Array} features - The features of the ministry, which will be different for each ministry
 * @param {User} payor - The user who is responsible for the subscription payments for the ministry
 * @param {Ministry} ownerMinistry - The ministry that owns this ministry, this means that this ministry is a sub ministry of the ownerMinistry
 *                                  the ownerMinistry can be the main ministry, or it can be a sub ministry of the main ministry
 * @param {Date} createdAt - The date the ministry was created
 * @param {Date} updatedAt - The date the ministry was last updated
 * @param {String} donationLink - The link to donate to the ministry
 */
const MinistrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a Ministry name'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    description: {
      type: String,
    },
    ministryImageUrl: {
      type: String,
    },
    ministryType: {
      type: String,
    },
    donationLink: {
      type: String,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
    },
    // party responsible for subscription payments
    payor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    initialPayment: {
      type: Date,
      // required: true,
    },
    nextPayment: {
      type: Date,
      // required: true,
    },
    isPaidAccount: {
      type: Boolean,
      default: true,
    },
    credits: {
      type: Number,
      default: 0,
    },
    // ownerMinistry is the ministry that owns this ministry
    // this means that this ministry is a sub ministry of the ownerMinistry
    // the ownerMinistry can be the main ministry, or it can be a sub ministry
    // of the main ministry
    ownerMinistry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ministry',
    },
    isMainMinistry: {
      type: Boolean,
      default: false,
    },
    isSubMinistry: {
      type: Boolean,
      default: false,
    },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    leaders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMinistry>('Ministry', MinistrySchema);
