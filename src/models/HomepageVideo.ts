import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomepageVideoHistory {
  videoUrl: string;
  videoUrlMedium?: string;
  videoUrlSmall?: string;
  posterUrl?: string;
  title?: string;
  description?: string;
  version: number;
  replacedAt: Date;
}

export interface IHomepageVideo extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoUrlMedium?: string;
  videoUrlSmall?: string;
  posterUrl?: string;
  isPublished: boolean;
  version: number;
  history: IHomepageVideoHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const HomepageVideoHistorySchema = new Schema<IHomepageVideoHistory>(
  {
    videoUrl: { type: String, required: true },
    videoUrlMedium: { type: String, default: "" },
    videoUrlSmall: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    version: { type: Number, required: true },
    replacedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const HomepageVideoSchema = new Schema<IHomepageVideo>(
  {
    title: {
      type: String,
      default: "Homepage Header Video",
      trim: true,
    },
    description: {
      type: String,
      default: "Background hero video displaying Zenith Academy highlights",
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrlMedium: {
      type: String,
      default: "",
      trim: true,
    },
    videoUrlSmall: {
      type: String,
      default: "",
      trim: true,
    },
    posterUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    history: {
      type: [HomepageVideoHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const HomepageVideo: Model<IHomepageVideo> =
  mongoose.models.HomepageVideo ||
  mongoose.model<IHomepageVideo>("HomepageVideo", HomepageVideoSchema);

export default HomepageVideo;
