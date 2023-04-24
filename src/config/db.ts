const mongoose = require("mongoose");
const colors = require("colors");

export default async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(colors.bgGreen.white("MongoDB Connected"));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
