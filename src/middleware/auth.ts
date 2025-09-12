import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: { _id: Types.ObjectId |string };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in .env");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    (req as AuthRequest).user = {_id: new Types.ObjectId(decoded.id)}
    next();
  } catch (err) {
    return res.status(401).json({error:"Invalid token"})
  }
}