import mongoose from "mongoose";

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description too long"],
    },
    category: {
      type: String,
      enum: ["book", "notes", "device", "other"],
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      default: "good",
    },
    images: [{ type: String }],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    isbn: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String, maxlength: [500, "Review too long"] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

marketplaceItemSchema.index({ seller: 1 });
marketplaceItemSchema.index({ category: 1, isAvailable: 1 });
marketplaceItemSchema.index({ title: "text", description: "text" });

marketplaceItemSchema.virtual("averageRating").get(function () {
  if (!this.ratings?.length) return 0;
  return this.ratings.reduce((sum, r) => sum + r.rating, 0) / this.ratings.length;
});

marketplaceItemSchema.virtual("favoriteCount").get(function () {
  return this.favorites?.length || 0;
});

marketplaceItemSchema.set("toJSON", { virtuals: true });

const MarketplaceItem = mongoose.model("MarketplaceItem", marketplaceItemSchema);

export default MarketplaceItem;
