// models/Resume.ts
import { Schema, model, models, InferSchemaType } from "mongoose";

const ResumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  currentVersionId: {
    type: Schema.Types.ObjectId, ref: "ResumeVersion"
  }
}, { timestamps: true });

const PersonalInfoSchema = new Schema({
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  summary: { type: String, default: '' }
}, { _id: false });

const EducationSchema = new Schema({
  school: { type: String, default: '' },
  degree: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' }
}, { _id: false });

const ExperienceSchema = new Schema({
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  bullets: [String]
}, { _id: false });

const ResumeVersionSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
  version: Number,
  personal: PersonalInfoSchema,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [String]
}, { timestamps: true });

export type ResumeType = InferSchemaType<typeof ResumeSchema>;
export type ResumeVersionType = InferSchemaType<typeof ResumeVersionSchema>;


export const ResumeVersion = models.ResumeVersion || model("ResumeVersion", ResumeVersionSchema);
export const Resume = models.Resume || model("Resume", ResumeSchema);

export type ResumeWithVersions = ResumeType & {
  versions:ResumeVersionType[]
}
