import mongoose from "mongoose";


export async function connectDB() {

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
  }
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "resume-platform"
    });
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Initial MongoDB connection error: ", err);
    process.exit(1);
  }
}