import mongoose from "mongoose";
// import ObjectId from "mongoose";
import { ObjectId } from "mongodb";

/**
 * @description - Interface for Family Schema
 * 
 * @author Austin Howard 
 * @since 1.0
 * @version 1.0
 * @lastModified - 2023-06-11T16:20:04.000-05:00
 */
export default interface FamilyType extends mongoose.Document {
  _id: string;
  name: string;
  members: ObjectId[];
  contact: ObjectId;
  notes: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
