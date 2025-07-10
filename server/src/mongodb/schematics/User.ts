import mongoose, { Schema, Document } from "mongoose";
import { INotification, NotificationSchema } from "./Notifications";
import { ITransection, TransectionSchema } from "./Transections";

export enum Tier {
  Free = "free",
  Plus = "plus",
  Premium = "premium",
}

export enum Expiration {
  Default = "7d",
  None = "never",
  OneMonth = "30d",
  TwoMonth = "60d",
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  image: string;

  tier: Tier;
  sessionTimeOut: Expiration;
  income: number;
  monthlyBudget: number;

  notifications: INotification[];
  notificationsOn: boolean;
  emailNotificationsOn: boolean;

  transections: ITransection[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: null },

    tier: { type: String, enum: Object.values(Tier), default: Tier.Free },
    sessionTimeOut: {
      type: String,
      enum: Object.values(Expiration),
      default: Expiration.Default,
    },
    income: { type: Number, default: 0 },
    monthlyBudget: { type: Number, default: 0 },

    notifications: { type: [NotificationSchema], default: [] },
    notificationsOn: { type: Boolean, default: true },
    emailNotificationsOn: { type: Boolean, default: true },

    transections: { type: [TransectionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
