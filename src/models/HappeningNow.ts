import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHappeningNow extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HappeningNowSchema = new Schema<IHappeningNow>(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

HappeningNowSchema.index({ order: 1, createdAt: -1 });

export const HappeningNow: Model<IHappeningNow> =
  mongoose.models.HappeningNow ||
  mongoose.model<IHappeningNow>("HappeningNow", HappeningNowSchema);

export default HappeningNow;
