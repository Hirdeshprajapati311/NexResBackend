"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipOnboarding = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ error: "User already exists" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 11);
        const newUser = new User_1.default({
            username,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: "User registered", user: newUser });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: "Invalid credentials" });
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not defined in .env");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        const { password: _, ...userObject } = user.toObject();
        res.json({ message: "Login Successfull", token, user: userObject });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User_1.default.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getMe = getMe;
const skipOnboarding = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        await User_1.default.findByIdAndUpdate(req.user._id, { seenOnboarding: true });
        res.json({ message: "skipped" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.skipOnboarding = skipOnboarding;
