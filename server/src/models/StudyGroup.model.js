import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    maxMembers: {
      type: Number,
      default: 20,
      min: 2,
      max: 50,
    },
    inviteCode: {
      type: String,
      unique: true,
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ "members.user": 1 });
studyGroupSchema.index({ inviteCode: 1 });

const StudyGroup = mongoose.model("StudyGroup", studyGroupSchema);

export default StudyGroup;
