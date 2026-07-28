import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    location: {
      type: String,
      trim: true,
    },
    materials: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["pdf", "video", "link", "file"],
        },
      },
    ],
    isRecurring: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lectureSchema.index({ course: 1, dayOfWeek: 1 });
lectureSchema.index({ course: 1 });

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
