import pomodoroService from "../services/pomodoro.service.js";

export const logSession = async (req, res, next) => {
  try {
    const session = await pomodoroService.logSession(req.body, req.user._id);
    res.status(201).json({ success: true, data: { session } });
  } catch (error) { next(error); }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await pomodoroService.getStats(req.user._id, req.query);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};
