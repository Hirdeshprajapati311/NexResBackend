import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createNewResumeVersion, createResume, deleteResume, downloadResumePDF, getResumeById, getUserResumes } from "../controllers/resumeController";


const resumeRouter = Router()

resumeRouter.post("/:id/versions", authMiddleware, createNewResumeVersion);
resumeRouter.get("/:id/pdf", authMiddleware, downloadResumePDF);

resumeRouter.post("/",authMiddleware, createResume)
resumeRouter.get("/", authMiddleware, getUserResumes);

resumeRouter.get("/:id", authMiddleware, getResumeById);
resumeRouter.delete("/:id",authMiddleware, deleteResume);



export default resumeRouter;