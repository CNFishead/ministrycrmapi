import mongoose from "mongoose";

/**
 * @description Interface for the User model
 * 
 * @author Austin Howard 
 * @since 1.0
 * @version 1.0
 * @lastModified - 2023-06-11T16:20:26.000-05:00
 */
export default interface UserType extends mongoose.Document {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  sex: string;
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
  role: string;
  handler: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address2: string;
  fullName: string;
  isActive: boolean;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  createdAt: Date;
  updatedAt: Date;
  credits: number;
  isEmailVerified: boolean;
  getSignedJwtToken: () => string;
  getResetPasswordToken: () => string;
  matchPassword: (enteredPassword: string) => boolean;
}
