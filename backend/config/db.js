const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = "mongodb://127.0.0.1:27017/medibook";

    try {
      await mongoose.connect(primaryUri);
      console.log("MongoDB connected");
      return;
    } catch (primaryError) {
      if (primaryUri && primaryUri !== fallbackUri) {
        console.warn(
          "Primary MongoDB connection failed, trying local fallback:",
          primaryError.message,
        );
        await mongoose.connect(fallbackUri);
        console.log("MongoDB connected to local fallback");
        return;
      }

      throw primaryError;
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
