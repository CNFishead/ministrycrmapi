import mongoose from "mongoose";
import NotificationType from "../types/NotificationType";

const NotificationSchema = new mongoose.Schema(
  {
    userTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // if this notification comes from a user, i.e. a comment, like, follow, etc.
    userFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    description: String,
    notificationType: String,
    opened: {
      type: Boolean,
      default: false,
    },
    entityId: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.statics.insertNotification = async function (
  userTo,
  userFrom,
  description,
  message,
  notificationType,
  entityId
) {
  const notification = new this({
    userTo,
    userFrom,
    description,
    message,
    notificationType,
    entityId,
  });
  await this.deleteOne({
    userTo,
    userFrom,
    description,
    message,
    notificationType,
    entityId,
  }).catch((err: any) => console.log(err));
  return await notification.save().catch((err: any) => console.log(err));
};

export default mongoose.model<NotificationType>("Notification", NotificationSchema);
