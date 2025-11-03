import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URL, {
      dbName: process.env.MONGO_DB,
    })
    .then(() => console.log(`✅ MongoDB Connected to ${process.env.MONGO_DB}`))
    .catch((err) => console.log(err));
};
