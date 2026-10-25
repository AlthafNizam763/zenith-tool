import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentSuccessStory extends Document {
  title: string;
  studentName: string;
  type: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string; // poster for video or alternative view
  description?: string;
  achievementDetails?: string; // e.g., "Rank 1 | JHI 2024"
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSuccessStorySchema = new Schema<IStudentSuccessStory>(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    studentName: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
      default: "image",
    },
    mediaUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    achievementDetails: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

StudentSuccessStorySchema.index({ order: 1, createdAt: -1 });

export const StudentSuccessStory: Model<IStudentSuccessStory> =
  mongoose.models.StudentSuccessStory ||
  mongoose.model<IStudentSuccessStory>(
    "StudentSuccessStory",
    StudentSuccessStorySchema
  );

export default StudentSuccessStory;
