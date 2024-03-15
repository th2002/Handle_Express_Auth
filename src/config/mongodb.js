import mongoose from "mongoose";
import { env } from "./environment";

export const CONNECT_DB = async () => {
  try {
    const db = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true,
    });

    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
};

export const CLOSE_DB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error disconnecting from MongoDB Atlas:", error);
  }
};

