import adminService from "../services/admin.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["student", "tutor", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    const user = await adminService.updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await adminService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

export const getModerationQueue = async (req, res, next) => {
  try {
    const queue = await adminService.getModerationQueue();
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

export const getActivityLog = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const log = await adminService.getActivityLog(days);
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
