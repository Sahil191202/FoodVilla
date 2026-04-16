import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Min 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ Owner specific fields
    businessName: {
      type: String,
      trim: true,
    },
    businessPhone: {
      type: String,
      trim: true,
    },

    // ✅ Owner approval status
    // pending_approval = subscribed but admin hasnt approved yet
    // approved = admin approved, dashboard accessible
    // rejected = admin rejected
    ownerStatus: {
      type: String,
      enum: ["none", "pending_approval", "approved", "rejected"],
      default: "none",
    },

    currentPlan: {
      type: String,
      enum: ["none", "free_trial", "premium", "featured"],
      default: "none",
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },

    // ✅ Razorpay customer ID
    razorpayCustomerId: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);