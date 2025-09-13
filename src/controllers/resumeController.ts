import User from "../models/User";
import {Request,Response} from "express"
import { generateResumePDF } from "../utils/pdfGenerator";
import  { Resume, ResumeVersion,  } from "../models/Resume";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";


export const createResume = async (req: AuthRequest, res: Response) => {
  

  const session = await mongoose.startSession();
  session.startTransaction();

  try {


    const { title, personal, education, experience, skills } = req.body;
    const userId = req.user?._id;
    

    const resume = new Resume({ userId, title:title || "Untitled Resume" })
    await resume.save({ session });

    const version = new ResumeVersion({
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
  } catch (err) {
    await session.abortTransaction();
    console.error("Error creating resume:", err);
    res.status(500).json({message:"Error creating resume"});
  } finally {
    session.endSession();
  }
}

export const getUserResumes = async (req: AuthRequest, res: Response) => {
  try {
    
    const resumes = await Resume.find({ userId: req.user?._id }).populate("currentVersionId");
    res.json(resumes);
  } catch (err) {
    console.error("Error fetching user resumes:", err);
    res.status(500).json({ message: "Error fetching resumes" });
  }
};


export const getResumeById = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate("currentVersionId");

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const versions = await ResumeVersion.find({ resumeId: resume._id }).lean();
    res.json({ ...resume.toObject(), versions });
  } catch (err) {
    console.error("Error fetching resume by ID:", err);
    res.status(500).json({ message: "Error fetching resume" });
  }
};


export const updateResume = async (req: Request, res: Response) => {
  try {
    
    const { _id: versionId, personal, education, experience, skills } = req.body;

    const updatedVersion = await ResumeVersion.findByIdAndUpdate(
      versionId,
      { personal, education, experience, skills },
      { new: true }
    ).lean();

    if (!updatedVersion) return res.status(404).json({ message: "Version to update not found" });

    res.json(updatedVersion);
  } catch (err) {
    console.error("Error updating resume:", err);
    res.status(500).json({ message: "Error updating resume" });
  }
}

export const createNewResumeVersion = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { personal, education, experience, skills, title } = req.body;
    const resume = await Resume.findById(req.params.id).session(session);

    if (!resume) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Resume not found" });
    }

    if (title) {
      resume.title = title;
    }

    const lastVersion = await ResumeVersion.findOne({ resumeId: resume._id }).sort({ version: -1 }).session(session);

    const newVersion = new ResumeVersion({
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
  } catch (err) {
    await session.abortTransaction();
    console.error("Error creating new version:", err);
    res.status(500).json({ message: "Error creating new version" });
  } finally {
    session.endSession();
  }
}


export const downloadResumePDF = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id).populate("currentVersionId");
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const pdfBuffer = await generateResumePDF(resume.currentVersionId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment;filename="${resume.title}.pdf"`,
    });
    res.send(pdfBuffer)
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({message:"Error generating PDF"});
  }
}


export const deleteResume = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const resumeId = req.params.id;

    const resume = await Resume.findById(resumeId).session(session);
    if (!resume) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Resume not found" });
    }
    
    if (resume.userId.toString() !== req.user?._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized to delete this resume" });
    }

    await ResumeVersion.deleteMany({ resumeId: resume._id }).session(session);
    await Resume.findByIdAndDelete(resumeId, { session });
    
    await session.commitTransaction();
    res.status(204).send(); // No content for successful delete
  } catch (err) {
    await session.abortTransaction();
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: "Error deleting resume" });
  } finally {
    session.endSession();
  }
}