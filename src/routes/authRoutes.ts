import { Router } from "express";
import { getMe, loginUser, registerUser, skipOnboarding } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";


const authRouters = Router();
authRouters.post("/register", registerUser);
authRouters.post("/login", loginUser);


authRouters.get("/me", authMiddleware, getMe);
authRouters.post("/skip-onboarding", authMiddleware, skipOnboarding);

export default authRouters;