import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer", "Winter"],
      required: [true, "Semester is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2020, "Year must be 2020 or later"],
      max: [2030, "Year must be 2030 or earlier"],
    },
    enrolledUsers: [
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
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    maxStudents: {
      type: Number,
      default: 0,
    },
    syllabus: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ instructor: 1, isActive: 1 });
courseSchema.index({ enrolledUsers: 1 });
courseSchema.index({ createdBy: 1 });
courseSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual: enrollment count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledUsers?.length || 0;
});

// Virtual: check if full
courseSchema.virtual("isFull").get(function () {
  if (this.maxStudents <= 0) return false;
  return this.enrolledUsers?.length >= this.maxStudents;
});

// Static: find active courses for a user
courseSchema.statics.findForUser = function (userId) {
  return this.find({
    enrolledUsers: userId,
    isActive: true,
  }).populate("instructor", "firstName lastName email avatar");
};

// Instance: enroll user
courseSchema.methods.enrollUser = async function (userId) {
  if (this.enrolledUsers.includes(userId)) {
    throw new Error("User already enrolled");
  }
  if (this.isFull) {
    throw new Error("Course is full");
  }
  this.enrolledUsers.push(userId);
  return this.save();
};

// Instance: unenroll user
courseSchema.methods.unenrollUser = async function (userId) {
  this.enrolledUsers = this.enrolledUsers.filter(
    (id) => id.toString() !== userId.toString()
  );
  return this.save();
};

const Course = mongoose.model("Course", courseSchema);

export default Course;
