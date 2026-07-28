import mongoose from "mongoose";

const fileFolderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [100, "Folder name cannot exceed 100 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileFolder",
      default: null,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

fileFolderSchema.index({ user: 1, parent: 1 });
fileFolderSchema.index({ user: 1, name: 1 });

const FileFolder = mongoose.model("FileFolder", fileFolderSchema);

export default FileFolder;
