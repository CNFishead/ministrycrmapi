import mongoose from "mongoose";
import MinistryType from "../types/MinistryType";

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
 *
 *
 *
 */
const MinistrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a Ministry name"],
    },
    description: {
      type: String,
    },
    ministryImageUrl: {
      type: String,
    },
    ministryType: {
      type: String,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    announcements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],

    features: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feature",
      },
    ],
    // party responsible for subscription payments
    payor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // ownerMinistry is the ministry that owns this ministry
    // this means that this ministry is a sub ministry of the ownerMinistry
    // the ownerMinistry can be the main ministry, or it can be a sub ministry
    // of the main ministry
    ownerMinistry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ministry",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<MinistryType>("Ministry", MinistrySchema);
