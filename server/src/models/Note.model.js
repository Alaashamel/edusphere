import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    content: {
      type: String,
      default: "",
    },
    contentJson: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    versionHistory: [
      {
        content: String,
        contentJson: mongoose.Schema.Types.Mixed,
        savedAt: { type: Date, default: Date.now },
      },
    ],
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
noteSchema.index({ createdBy: 1, folder: 1 });
noteSchema.index({ createdBy: 1, tags: 1 });
noteSchema.index({ createdBy: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text", tags: "text" });

// Keep last 20 versions
noteSchema.pre("save", function (next) {
  if (this.isModified("content") && this.versionHistory.length >= 20) {
    this.versionHistory = this.versionHistory.slice(-19);
  }
  next();
});

const Note = mongoose.model("Note", noteSchema);

export default Note;
