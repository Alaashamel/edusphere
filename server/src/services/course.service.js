import Course from "../models/Course.model.js";
import Lecture from "../models/Lecture.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class CourseService {
  async createCourse(data, userId) {
    const course = await Course.create({
      ...data,
      createdBy: userId,
      instructor: data.instructor || userId,
      enrolledUsers: [userId],
    });

    return course.populate("instructor", "firstName lastName email avatar");
  }

  async getCourseById(courseId, userId) {
    const course = await Course.findById(courseId)
      .populate("instructor", "firstName lastName email avatar")
      .populate("enrolledUsers", "firstName lastName email avatar");

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course;
  }

  async getUserCourses(userId, { semester, year, search, page = 1, limit = 20 }) {
    const query = {
      enrolledUsers: userId,
      isActive: true,
    };

    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year, 10);
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor", "firstName lastName email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    return {
      courses,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateCourse(courseId, updateData, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.createdBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to update this course", 403);
    }

    const allowedUpdates = [
      "title",
      "description",
      "color",
      "icon",
      "semester",
      "year",
      "tags",
      "maxStudents",
      "syllabus",
      "isActive",
    ];

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        course[key] = updateData[key];
      }
    }

    await course.save();
    return course.populate("instructor", "firstName lastName email avatar");
  }

  async deleteCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (course.createdBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to delete this course", 403);
    }

    await Course.findByIdAndDelete(courseId);
    await Lecture.deleteMany({ course: courseId });

    return true;
  }

  async enrollInCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    await course.enrollUser(userId);
    return course;
  }

  async unenrollFromCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    await course.unenrollUser(userId);
    return course;
  }

  // Lectures
  async createLecture(data, userId) {
    const course = await Course.findById(data.course);
    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const lecture = await Lecture.create({
      ...data,
      createdBy: userId,
    });

    return lecture;
  }

  async getCourseLectures(courseId) {
    return Lecture.find({ course: courseId })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .populate("createdBy", "firstName lastName");
  }

  async updateLecture(lectureId, updateData, userId) {
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      throw new AppError("Lecture not found", 404);
    }

    Object.assign(lecture, updateData);
    await lecture.save();
    return lecture;
  }

  async deleteLecture(lectureId) {
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      throw new AppError("Lecture not found", 404);
    }
    return true;
  }
}

export default new CourseService();
