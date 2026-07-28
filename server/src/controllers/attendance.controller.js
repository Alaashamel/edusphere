import attendanceService from "../services/attendance.service.js";

export const markAttendance = async (req, res, next) => {
  try {
    const { courseId, records } = req.body;
    const attendance = await attendanceService.markAttendance(req.user._id, courseId, records);
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const removeAttendanceRecord = async (req, res, next) => {
  try {
    const { courseId, date } = req.params;
    const attendance = await attendanceService.removeRecord(req.user._id, courseId, date);
    if (!attendance) {
      return res.status(404).json({ success: false, message: "No attendance record found" });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const attendance = await attendanceService.getAttendanceByCourse(req.user._id, courseId);
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getAllAttendance(req.user._id);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await attendanceService.getStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await attendanceService.getAttendanceByDateRange(req.user._id, startDate, endDate);
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
