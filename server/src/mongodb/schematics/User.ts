import mongoose, { Schema, Document } from "mongoose";
import { INotification, NotificationSchema } from "./Notifications";

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

export enum TransectionType {
  Credit = "credit",
  Debit = "debit",
}

export interface ITransection {
  transectionType: TransectionType;
  amount: number;
  spentOn: string;
  spentOnDesc: string;
  onDate: Date;
  category: string;
  isAutopay: boolean;
  reoccurance: number;
}

// Subdocument Schema for Transection
const TransectionSchema = new Schema<ITransection>(
  {
    transectionType: {
      type: String,
      enum: Object.values(TransectionType),
      required: true,
    },
    amount: { type: Number, required: true },
    spentOn: { type: String, required: true },
    spentOnDesc: { type: String, required: true },
    onDate: { type: Date, required: true },
    category: { type: String, required: true },
    isAutopay: { type: Boolean, default: false },
    reoccurance: { type: Number, default: 0 }, // in days
  },
  { _id: true } 
);

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;

  tier: Tier;
  sessionTimeOut: Expiration;
  income: number;

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

    tier: { type: String, enum: Object.values(Tier), default: Tier.Free },
    sessionTimeOut: {
      type: String,
      enum: Object.values(Expiration),
      default: Expiration.Default,
    },
    income: { type: Number, default: 0 },

    notifications: { type: [NotificationSchema], default: [] },
    notificationsOn: { type: Boolean, default: true },
    emailNotificationsOn: { type: Boolean, default: true },

    transections: { type: [TransectionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
