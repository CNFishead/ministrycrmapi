import { ObjectId } from "mongoose";
import UserType from "./UserType";

export default interface NotificationType {
  userTo: UserType;
  userFrom: UserType;
  message: string;
  description: string;
  notificationType: string;
  opened: boolean;
  entityId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
