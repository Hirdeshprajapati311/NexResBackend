import { Request, Response } from "express";

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 11);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      
    });

    await newUser.save();
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err: any) {
    res.status(500).json({error:err.message})
  }
}



export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in .env");
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string,
      {
        expiresIn: "1d"
      }
    );
    const { password: _, ...userObject } = user.toObject();

    res.json({ message: "Login Successfull", token, user: userObject });
  } catch (err: any) {
    res.status(500).json({error:err.message})
  }
}


export const getMe = async (req: AuthRequest, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({error:"Unauthorized"})
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({error:"User not found"})
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({error:err.message})
  }
}

export const skipOnboarding = async (req: AuthRequest, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await User.findByIdAndUpdate(req.user._id, { seenOnboarding: true });
    res.json({message:"skipped"})
  } catch (err:any){
    res.status(500).json({message:err.message})
  }
}