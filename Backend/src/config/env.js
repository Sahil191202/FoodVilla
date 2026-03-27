import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  MAIL: {
    HOST: process.env.MAIL_HOST,
    PORT: process.env.MAIL_PORT || 587,
    USER: process.env.MAIL_USER,
    PASS: process.env.MAIL_PASS,
  },
};
