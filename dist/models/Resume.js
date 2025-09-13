"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resume = exports.ResumeVersion = void 0;
// models/Resume.ts
const mongoose_1 = require("mongoose");
const ResumeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: String,
    currentVersionId: {
        type: mongoose_1.Schema.Types.ObjectId, ref: "ResumeVersion"
    }
}, { timestamps: true });
const PersonalInfoSchema = new mongoose_1.Schema({
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    summary: { type: String, default: '' }
}, { _id: false });
const EducationSchema = new mongoose_1.Schema({
    school: { type: String, default: '' },
    degree: { type: String, default: '' },
    start: { type: String, default: '' },
    end: { type: String, default: '' }
}, { _id: false });
const ExperienceSchema = new mongoose_1.Schema({
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    start: { type: String, default: '' },
    end: { type: String, default: '' },
    bullets: [String]
}, { _id: false });
const ResumeVersionSchema = new mongoose_1.Schema({
    resumeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Resume" },
    version: Number,
    personal: PersonalInfoSchema,
    education: [EducationSchema],
    experience: [ExperienceSchema],
    skills: [String]
}, { timestamps: true });
exports.ResumeVersion = mongoose_1.models.ResumeVersion || (0, mongoose_1.model)("ResumeVersion", ResumeVersionSchema);
exports.Resume = mongoose_1.models.Resume || (0, mongoose_1.model)("Resume", ResumeSchema);
