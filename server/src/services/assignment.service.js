import Assignment from "../models/Assignment.model.js";
import Course from "../models/Course.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class AssignmentService {
  async createAssignment(data, userId) {
    const course = await Course.findById(data.course);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.createdBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to create assignments for this course", 403);
    }

    const assignment = await Assignment.create({
      ...data,
      createdBy: userId,
      assignedTo: course.enrolledUsers,
    });

    return assignment.populate("course", "title code color");
  }

  async getAssignmentById(assignmentId) {
    const assignment = await Assignment.findById(assignmentId)
      .populate("course", "title code color")
      .populate("createdBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName email avatar");

    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    return assignment;
  }

  async getUserAssignments(userId, { status, priority, courseId, page = 1, limit = 20 }) {
    const query = {
      $or: [{ assignedTo: userId }, { createdBy: userId }],
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;
    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate("course", "title code color")
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(query),
    ]);

    return {
      assignments,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateAssignment(assignmentId, updateData, userId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    if (assignment.createdBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to update this assignment", 403);
    }

    const allowedUpdates = [
      "title",
      "description",
      "dueDate",
      "priority",
      "maxPoints",
      "attachments",
      "estimatedDifficulty",
      "estimatedTime",
      "isPublished",
    ];

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        assignment[key] = updateData[key];
      }
    }

    await assignment.save();
    return assignment.populate("course", "title code color");
  }

  async deleteAssignment(assignmentId, userId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    if (assignment.createdBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to delete this assignment", 403);
    }

    await Assignment.findByIdAndDelete(assignmentId);
    return true;
  }

  async submitAssignment(assignmentId, submissionData, userId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    if (assignment.status === "graded") {
      throw new AppError("Cannot resubmit a graded assignment", 400);
    }

    assignment.submission = {
      content: submissionData.content,
      files: submissionData.files || [],
      submittedAt: new Date(),
    };
    assignment.status = "submitted";

    await assignment.save();
    return assignment;
  }

  async gradeAssignment(assignmentId, gradeData, userId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }

    if (assignment.status !== "submitted") {
      throw new AppError("Can only grade submitted assignments", 400);
    }

    assignment.submission.grade = {
      points: gradeData.points,
      maxPoints: assignment.maxPoints,
      letterGrade: gradeData.letterGrade,
      feedback: gradeData.feedback,
      gradedBy: userId,
      gradedAt: new Date(),
    };
    assignment.status = "graded";

    await assignment.save();
    return assignment.populate("course", "title code color");
  }

  async getOverdueAssignments(userId) {
    return Assignment.find({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $in: ["pending", "in_progress"] },
    })
      .populate("course", "title code color")
      .sort({ dueDate: 1 });
  }

  async getUpcomingAssignments(userId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return Assignment.find({
      assignedTo: userId,
      dueDate: { $gte: new Date(), $lte: futureDate },
      status: { $in: ["pending", "in_progress"] },
    })
      .populate("course", "title code color")
      .sort({ dueDate: 1 });
  }
}

export default new AssignmentService();
