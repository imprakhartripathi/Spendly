import mongoose, { Schema, Document } from "mongoose";
import { INotification, NotificationSchema } from "./Notifications";

export enum Tier {
  Free = "free",
  Plus = "plus",
  Premium = "premium",
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;

  tier: Tier;
  income: number;
  notifications: INotification[];

  notificationsOn: boolean;
  emailNotificationsOn: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    tier: { type: String, enum: Object.values(Tier), default: Tier.Free },
    income: { type: Number, default: 0 },

    notifications: { type: [NotificationSchema], default: [] },
    notificationsOn: { type: Boolean, default: true },
    emailNotificationsOn: { type: Boolean, default: true },
  },
  { timestamps: true } 
);

export default mongoose.model<IUser>("User", UserSchema);
