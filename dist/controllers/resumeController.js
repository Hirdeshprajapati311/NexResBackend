"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResume = exports.downloadResumePDF = exports.createNewResumeVersion = exports.updateResume = exports.getResumeById = exports.getUserResumes = exports.createResume = void 0;
const pdfGenerator_1 = require("../utils/pdfGenerator");
const Resume_1 = require("../models/Resume");
const mongoose_1 = __importDefault(require("mongoose"));
const createResume = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { title, personal, education, experience, skills } = req.body;
        const userId = req.user?._id;
        const resume = new Resume_1.Resume({ userId, title: title || "Untitled Resume" });
        await resume.save({ session });
        const version = new Resume_1.ResumeVersion({
            resumeId: resume._id,
            version: 1,
            personal,
            experience,
            education,
            skills,
        });
        await version.save({ session });
        resume.currentVersionId = version._id;
        await resume.save({ session });
        await session.commitTransaction();
        res.status(201).json({ resume, version });
    }
    catch (err) {
        await session.abortTransaction();
        console.error("Error creating resume:", err);
        res.status(500).json({ message: "Error creating resume" });
    }
    finally {
        session.endSession();
    }
};
exports.createResume = createResume;
const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume_1.Resume.find({ userId: req.user?._id }).populate("currentVersionId");
        res.json(resumes);
    }
    catch (err) {
        console.error("Error fetching user resumes:", err);
        res.status(500).json({ message: "Error fetching resumes" });
    }
};
exports.getUserResumes = getUserResumes;
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume_1.Resume.findById(req.params.id)
            .populate("currentVersionId");
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        const versions = await Resume_1.ResumeVersion.find({ resumeId: resume._id }).lean();
        res.json({ ...resume.toObject(), versions });
    }
    catch (err) {
        console.error("Error fetching resume by ID:", err);
        res.status(500).json({ message: "Error fetching resume" });
    }
};
exports.getResumeById = getResumeById;
const updateResume = async (req, res) => {
    try {
        const { _id: versionId, personal, education, experience, skills } = req.body;
        const updatedVersion = await Resume_1.ResumeVersion.findByIdAndUpdate(versionId, { personal, education, experience, skills }, { new: true }).lean();
        if (!updatedVersion)
            return res.status(404).json({ message: "Version to update not found" });
        res.json(updatedVersion);
    }
    catch (err) {
        console.error("Error updating resume:", err);
        res.status(500).json({ message: "Error updating resume" });
    }
};
exports.updateResume = updateResume;
const createNewResumeVersion = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { personal, education, experience, skills, title } = req.body;
        const resume = await Resume_1.Resume.findById(req.params.id).session(session);
        if (!resume) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Resume not found" });
        }
        if (title) {
            resume.title = title;
        }
        const lastVersion = await Resume_1.ResumeVersion.findOne({ resumeId: resume._id }).sort({ version: -1 }).session(session);
        const newVersion = new Resume_1.ResumeVersion({
            resumeId: resume._id,
            version: (lastVersion?.version || 0) + 1,
            personal,
            education,
            experience,
            skills,
        });
        await newVersion.save({ session });
        resume.currentVersionId = newVersion._id;
        await resume.save({ session });
        await session.commitTransaction();
        const populatedResume = await resume.populate('currentVersionId');
        res.json({ resume: populatedResume.toObject(), newVersion });
    }
    catch (err) {
        await session.abortTransaction();
        console.error("Error creating new version:", err);
        res.status(500).json({ message: "Error creating new version" });
    }
    finally {
        session.endSession();
    }
};
exports.createNewResumeVersion = createNewResumeVersion;
const downloadResumePDF = async (req, res) => {
    try {
        const resume = await Resume_1.Resume.findById(req.params.id).populate("currentVersionId");
        if (!resume)
            return res.status(404).json({ message: "Resume not found" });
        const pdfBuffer = await (0, pdfGenerator_1.generateResumePDF)(resume.currentVersionId);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment;filename="${resume.title}.pdf"`,
        });
        res.send(pdfBuffer);
    }
    catch (err) {
        console.error("Error generating PDF:", err);
        res.status(500).json({ message: "Error generating PDF" });
    }
};
exports.downloadResumePDF = downloadResumePDF;
const deleteResume = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const resumeId = req.params.id;
        const resume = await Resume_1.Resume.findById(resumeId).session(session);
        if (!resume) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Resume not found" });
        }
        if (resume.userId.toString() !== req.user?._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({ message: "Unauthorized to delete this resume" });
        }
        await Resume_1.ResumeVersion.deleteMany({ resumeId: resume._id }).session(session);
        await Resume_1.Resume.findByIdAndDelete(resumeId, { session });
        await session.commitTransaction();
        res.status(204).send(); // No content for successful delete
    }
    catch (err) {
        await session.abortTransaction();
        console.error("Error deleting resume:", err);
        res.status(500).json({ message: "Error deleting resume" });
    }
    finally {
        session.endSession();
    }
};
exports.deleteResume = deleteResume;
