import mongoose from "mongoose";

const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["focus", "short-break", "long-break"],
      default: "focus",
    },
    duration: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    task: {
      type: String,
      trim: true,
      maxlength: [200, "Task too long"],
    },
  },
  { timestamps: true }
);

pomodoroSessionSchema.index({ user: 1, createdAt: -1 });

const PomodoroSession = mongoose.model("PomodoroSession", pomodoroSessionSchema);

export default PomodoroSession;
