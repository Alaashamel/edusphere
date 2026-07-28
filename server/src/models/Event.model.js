import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["hackathon", "workshop", "study_session", "career_fair", "seminar", "social", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingUrl: {
      type: String,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      min: [1, "Max participants must be at least 1"],
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "waitlisted", "cancelled"],
          default: "registered",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    image: {
      type: String,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    reminder: {
      enabled: { type: Boolean, default: false },
      minutesBefore: { type: Number, default: 30 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.index({ creator: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: "text", description: "text", tags: "text" });

eventSchema.virtual("participantCount").get(function () {
  return this.participants.filter((p) => p.status === "registered").length;
});

eventSchema.virtual("isFull").get(function () {
  if (!this.maxParticipants) return false;
  return this.participantCount >= this.maxParticipants;
});

eventSchema.virtual("spotsLeft").get(function () {
  if (!this.maxParticipants) return null;
  return Math.max(0, this.maxParticipants - this.participantCount);
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
