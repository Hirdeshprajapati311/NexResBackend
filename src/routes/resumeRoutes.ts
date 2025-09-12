import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createNewResumeVersion, createResume, deleteResume, downloadResumePDF, getResumeById, getUserResumes, updateResume } from "../controllers/resumeController";


const resumeRouter = Router()


resumeRouter.post("/",authMiddleware, createResume)
resumeRouter.get("/", authMiddleware, getUserResumes);

resumeRouter.post("/:id/versions", authMiddleware, createNewResumeVersion);
resumeRouter.get("/:id/pdf", authMiddleware, downloadResumePDF);

resumeRouter.get("/:id", authMiddleware, getResumeById);
resumeRouter.put("/:id", authMiddleware, updateResume);
resumeRouter.delete("/:id",authMiddleware, deleteResume);



export default resumeRouter;