import courseService from "../services/course.service.js";

export const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Course created",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id, req.user._id);
    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCourses = async (req, res, next) => {
  try {
    const result = await courseService.getUserCourses(req.user._id, req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.body,
      req.user._id
    );
    res.json({
      success: true,
      message: "Course updated",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user._id);
    res.json({
      success: true,
      message: "Course deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const course = await courseService.enrollInCourse(req.params.id, req.user._id);
    res.json({
      success: true,
      message: "Enrolled successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const unenrollFromCourse = async (req, res, next) => {
  try {
    const course = await courseService.unenrollFromCourse(req.params.id, req.user._id);
    res.json({
      success: true,
      message: "Unenrolled successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const createLecture = async (req, res, next) => {
  try {
    const lecture = await courseService.createLecture(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Lecture created",
      data: { lecture },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseLectures = async (req, res, next) => {
  try {
    const lectures = await courseService.getCourseLectures(req.params.id);
    res.json({
      success: true,
      data: { lectures },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLecture = async (req, res, next) => {
  try {
    const lecture = await courseService.updateLecture(
      req.params.lectureId,
      req.body,
      req.user._id
    );
    res.json({
      success: true,
      message: "Lecture updated",
      data: { lecture },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLecture = async (req, res, next) => {
  try {
    await courseService.deleteLecture(req.params.lectureId);
    res.json({
      success: true,
      message: "Lecture deleted",
    });
  } catch (error) {
    next(error);
  }
};
