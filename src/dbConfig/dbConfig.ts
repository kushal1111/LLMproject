import mongoose from "mongoose";
export const dbConfig = async () => {
  try {
    const dbUrl = process.env.MONGO_HOST;
    if (!dbUrl) {
      throw new Error("MONGO_HOST is not defined in the environment variables");
    }
    await mongoose.connect(dbUrl);
    const connection = mongoose.connection;
    connection.on("error", (err) => {
      console.error("Database connection error:", err);
    });
    connection.once("connected", () => {
      console.log("Database connection established");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
