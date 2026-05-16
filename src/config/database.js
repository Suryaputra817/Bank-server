import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MogoDB connection failed", error);
    process.exit(1);
  }
}
export default connectDB;
