import mongoose from "mongoose";

/**
 * @param {String} name - The name of the family
 * @param {ObjectId[]} members - The members of the family, each member is a reference to a user object in the database
 * @param {ObjectId} contact - The contact of the family, this is a reference to a member object in the database
 * @param {String[]} notes - Notes about the family.
 * @param {String[]} tags  - An array of tags or labels to categorize the family, such as "volunteers," "youth group," or "elderly care."
 *
 */
const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an event name"],
      // trim
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ministry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ministry",
    },
    startDate: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      trim: true,
    },
    attendees: [
      {
        status: {
          type: String,
          enum: ["going", "not going", "maybe"],
          default: "going",
        },
        email: {
          type: String,
        },
      },
    ],
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<any>("Event", EventSchema);
