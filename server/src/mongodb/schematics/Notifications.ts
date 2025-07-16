import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  Sys = "System",
  Auth = "Authentication",
  Promo = "Promotional",
  Budget = "Budget"
}

export interface INotification extends Document {
  title: string;
  desc: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    isRead: { type: Boolean, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export { NotificationSchema, Notification };
