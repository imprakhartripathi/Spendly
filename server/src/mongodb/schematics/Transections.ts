import { Schema } from "mongoose";

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

export const TransectionSchema = new Schema<ITransection>(
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
