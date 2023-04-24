const mongoose = require("mongoose");

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
      ref: "User",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["member", "leader", "admin"],
          default: "member",
          
        },
      },
    ],
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

    }
    ],
    subMinistries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ministry",
      },
    ],
  },
  { 
    timestamps: true,
  }
);

export default mongoose.model("Ministry", MinistrySchema);
 