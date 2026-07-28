import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
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
    start: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end: {
      type: Date,
      required: [true, "End date is required"],
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["class", "exam", "deadline", "reminder", "study", "custom"],
      default: "custom",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    location: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        default: 1,
      },
      endDate: Date,
      count: Number,
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["popup", "email"],
          default: "popup",
        },
        minutes: {
          type: Number,
          default: 15,
        },
      },
    ],
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
calendarEventSchema.index({ createdBy: 1, start: 1, end: 1 });
calendarEventSchema.index({ createdBy: 1, type: 1 });
calendarEventSchema.index({ course: 1 });

// Virtual: duration in minutes
calendarEventSchema.virtual("duration").get(function () {
  return (this.end - this.start) / (1000 * 60);
});

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

export default CalendarEvent;
