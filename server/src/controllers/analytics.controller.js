import analyticsService from "../services/analytics.service.js";

export const getAllAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAll(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFocusTime = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await analyticsService.getFocusTime(req.user._id, days);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getGpaData = async (req, res, next) => {
  try {
    const data = await analyticsService.getGpaData(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceData = async (req, res, next) => {
  try {
    const data = await analyticsService.getAttendanceData(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentData = async (req, res, next) => {
  try {
    const data = await analyticsService.getAssignmentData(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCourseData = async (req, res, next) => {
  try {
    const data = await analyticsService.getCourseData(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
