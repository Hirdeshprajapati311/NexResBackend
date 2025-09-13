import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouters from "./routes/authRoutes";
import resumeRouter from "./routes/resumeRoutes";

dotenv.config();
const app = express()

app.use(cors({
  origin: ['http://localhost:3000',"https://nex-resume-frontend-git-main-hirdeshprajapati311s-projects.vercel.app/"],
  credentials: true
}));
app.use(express.json())

app.use("/api/auth", authRouters)
app.use("/api/resume", resumeRouter)

export default app;
