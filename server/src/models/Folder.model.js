import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

folderSchema.index({ createdBy: 1, parent: 1 });
folderSchema.index({ createdBy: 1 });

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
