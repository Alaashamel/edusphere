import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "submitted", "graded", "returned"],
      default: "pending",
    },
    maxPoints: {
      type: Number,
      default: 100,
      min: [0, "Max points cannot be negative"],
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    submission: {
      content: String,
      files: [
        {
          name: String,
          url: String,
          type: String,
          size: Number,
        },
      ],
      submittedAt: Date,
      grade: {
        points: Number,
        maxPoints: Number,
        letterGrade: String,
        feedback: String,
        gradedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        gradedAt: Date,
      },
    },
    estimatedDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "very_hard"],
    },
    estimatedTime: {
      type: Number,
      description: "Estimated time in minutes",
    },
    isPublished: {
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ assignedTo: 1, status: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ dueDate: 1 });

// Virtual: is overdue
assignmentSchema.virtual("isOverdue").get(function () {
  return this.dueDate < new Date() && this.status !== "submitted" && this.status !== "graded";
});

// Virtual: days until due
assignmentSchema.virtual("daysUntilDue").get(function () {
  const diff = this.dueDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
