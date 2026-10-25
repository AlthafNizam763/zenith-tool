import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudyMaterialHistory {
  fileUrl: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  coverImageUrl?: string;
  version: number;
  replacedAt: Date;
  note?: string;
}

export interface IStudyMaterial extends Document {
  logicalId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  coverImageUrl?: string;
  version: number;
  history: IStudyMaterialHistory[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudyMaterialHistorySchema = new Schema<IStudyMaterialHistory>(
  {
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileFormat: { type: String, default: "pdf" },
    fileSize: { type: Number, default: 0 },
    coverImageUrl: { type: String, default: "" },
    version: { type: Number, required: true },
    replacedAt: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    logicalId: {
      type: String,
      required: true,
      unique: true,
      default: "rank_file",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      default: "Zenith Academy Rank File",
      trim: true,
    },
    description: {
      type: String,
      default:
        "Prepared by experienced faculty and aligned with the latest PSC and JHI syllabus, previous question patterns, and exam strategies.",
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      default: "zenith_rank_file.pdf",
      trim: true,
    },
    fileFormat: {
      type: String,
      default: "pdf",
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    coverImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    history: {
      type: [StudyMaterialHistorySchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const StudyMaterial: Model<IStudyMaterial> =
  mongoose.models.StudyMaterial ||
  mongoose.model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);

export default StudyMaterial;
