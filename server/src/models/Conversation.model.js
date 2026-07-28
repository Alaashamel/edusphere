import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    messages: [messageSchema],
    type: {
      type: String,
      enum: ["chat", "quiz", "flashcards", "note-assist"],
      default: "chat",
    },
    context: {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, createdAt: -1 });
conversationSchema.index({ user: 1, type: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
