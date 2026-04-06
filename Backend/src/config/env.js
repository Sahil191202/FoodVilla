import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MAIL: {
    HOST: process.env.MAIL_HOST,
    PORT: process.env.MAIL_PORT || 587,
    USER: process.env.MAIL_USER,
    PASS: process.env.MAIL_PASS,
  },
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
