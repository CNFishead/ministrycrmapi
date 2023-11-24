import mongoose from "mongoose";
import { ObjectId } from "mongoose";

/**
 * @description - Member Schema Type
 * 
 * @author Austin Howard 
 * @since 1.0
 * @version 1.0
 * @lastModified - 2023-06-11T16:20:04.000-05:00
 */
export default interface MemberType extends mongoose.Document {
  firstName: string;
  lastName: string;
  ministry: ObjectId[]; // user can be in multiple ministries
  mainMinistry: ObjectId; // user can only belong to one main ministry, i.e. the church.
  profileImageUrl: string;
  sex: string;
  email: string;
  phoneNumber: string;
  role: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    address2: string;
  },
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  birthday: Date;
  dateLastVisited: Date;
}
