import mongoose from "mongoose";

const fileVersionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: [255, "File name cannot exceed 255 characters"],
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FileFolder",
      default: null,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    versions: [fileVersionSchema],
    currentVersion: {
      type: Number,
      default: 1,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

fileSchema.index({ user: 1, folder: 1 });
fileSchema.index({ user: 1, isDeleted: 1 });
fileSchema.index({ user: 1, isStarred: 1 });
fileSchema.index({ user: 1, tags: 1 });
fileSchema.index({ name: "text", tags: "text" });
fileSchema.index({ "sharedWith.user": 1 });

fileSchema.virtual("fileType").get(function () {
  if (this.mimeType.startsWith("image/")) return "image";
  if (this.mimeType.startsWith("video/")) return "video";
  if (this.mimeType.startsWith("audio/")) return "audio";
  if (this.mimeType === "application/pdf") return "pdf";
  if (this.mimeType.includes("document") || this.mimeType.includes("word")) return "document";
  if (this.mimeType.includes("spreadsheet") || this.mimeType.includes("excel")) return "spreadsheet";
  if (this.mimeType.includes("presentation") || this.mimeType.includes("powerpoint")) return "presentation";
  return "other";
});

fileSchema.virtual("formattedSize").get(function () {
  const bytes = this.size;
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const File = mongoose.model("File", fileSchema);

export default File;
