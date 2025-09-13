"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
    if (mongoose_1.default.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose_1.default.connect(MONGODB_URI, {
            dbName: "resume-platform"
        });
        console.log("Successfully connected to MongoDB");
    }
    catch (err) {
        console.error("Initial MongoDB connection error: ", err);
        process.exit(1);
    }
}
