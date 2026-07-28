import mongoose from "mongoose";

const gpaEntrySchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, trim: true },
    credits: { type: Number, required: true, min: 0, max: 10 },
    grade: { type: String, required: true },
    gradePoints: { type: Number, required: true },
    semester: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const gpaTrackerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entries: [gpaEntrySchema],
    targetGpa: {
      type: Number,
      min: 0,
      max: 4,
    },
  },
  { timestamps: true }
);

gpaTrackerSchema.index({ user: 1 }, { unique: true });

const GpaTracker = mongoose.model("GpaTracker", gpaTrackerSchema);

export default GpaTracker;
