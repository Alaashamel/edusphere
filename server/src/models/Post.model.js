import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: [5000, "Comment too long"] },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "PostComment" },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title too long"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [10000, "Content too long"],
    },
    type: {
      type: String,
      enum: ["discussion", "question", "announcement"],
      default: "discussion",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
    },
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ title: "text", content: "text" });

postSchema.virtual("voteCount").get(function () {
  return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

postSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

postSchema.set("toJSON", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
