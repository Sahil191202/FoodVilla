import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // ✅ Image URL from Cloudinary
    image: {
      type: String,
      default: null,
    },
    // ✅ Cloudinary public_id for deletion
    imagePublicId: {
      type: String,
      default: null,
      select: false, // dont send to frontend
    },
    // ✅ Spice level for AI suggestions
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra_hot"],
      default: "medium",
    },
    // ✅ Tags for AI filtering
    tags: [
      {
        type: String,
        // e.g. "bestseller", "new", "healthy", "spicy"
      },
    ],
    // ✅ Nutritional info — optional
    calories: {
      type: Number,
      default: null,
    },
    preparationTime: {
      type: Number, // in minutes
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },
    items: [menuItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster search
menuSchema.index({ restaurant: 1, isActive: 1 });

export const Menu = mongoose.model("Menu", menuSchema);