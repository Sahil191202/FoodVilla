import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  MAIL_HOST: z.string().default("smtp.gmail.com"),
  MAIL_PORT: z.string().default("587"),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");

  if (parsed.error?.errors) {
    parsed.error.errors.forEach((err) => {
      console.error(`  ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error(parsed.error);
  }

  process.exit(1);
}

export const ENV = {
  PORT: parsed.data.PORT,
  NODE_ENV: parsed.data.NODE_ENV,
  MONGODB_URI: parsed.data.MONGODB_URI,
  JWT_SECRET: parsed.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsed.data.JWT_EXPIRES_IN,
  OPENAI_API_KEY: parsed.data.OPENAI_API_KEY,
  GROQ_API_KEY: parsed.data.GROQ_API_KEY,
  CORS_ORIGIN: parsed.data.CORS_ORIGIN,
  FRONTEND_URL: parsed.data.FRONTEND_URL,
  MAIL: {
    HOST: parsed.data.MAIL_HOST,
    PORT: parsed.data.MAIL_PORT,
    USER: parsed.data.MAIL_USER,
    PASS: parsed.data.MAIL_PASS,
  },
  CLOUDINARY_CLOUD_NAME: parsed.data.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: parsed.data.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: parsed.data.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: parsed.data.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: parsed.data.RAZORPAY_KEY_SECRET,
};