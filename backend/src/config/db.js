const mongoose = require("mongoose");

async function connectDB(mongoUri) {
  if (!mongoUri) return;
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.warn(
      "MongoDB connection failed (this may be a dev environment):",
      err.message
    );
  }
}

module.exports = { connectDB };
