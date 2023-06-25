import mongoose from "mongoose";
import FamilyType from "../types/FamilyType";

/**
 * @param {String} name - The name of the family
 * @param {ObjectId[]} members - The members of the family, each member is a reference to a user object in the database
 * @param {ObjectId} contact - The contact of the family, this is a reference to a member object in the database
 * @param {String[]} notes - Notes about the family.
 * @param {String[]} tags  - An array of tags or labels to categorize the family, such as "volunteers," "youth group," or "elderly care."
 *
 */
const FamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      // trim
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        // makes sure the same member is not added twice
        unique: true,
      },
    ],
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    notes: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
export default mongoose.model<FamilyType>("Family", FamilySchema);
