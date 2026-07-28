import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    lectureTitle: {
      type: String,
      trim: true,
      maxlength: [200, "Lecture title cannot exceed 200 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    records: [attendanceRecordSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

attendanceSchema.index({ user: 1, course: 1 }, { unique: true });
attendanceSchema.index({ user: 1 });

attendanceSchema.virtual("totalSessions").get(function () {
  return this.records.length;
});

attendanceSchema.virtual("presentCount").get(function () {
  return this.records.filter((r) => r.status === "present").length;
});

attendanceSchema.virtual("attendancePercentage").get(function () {
  if (this.records.length === 0) return 0;
  return Math.round(
    (this.records.filter((r) => r.status === "present" || r.status === "late" || r.status === "excused").length /
      this.records.length) *
      100
  );
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
