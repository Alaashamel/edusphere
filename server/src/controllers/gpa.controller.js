import gpaService from "../services/gpa.service.js";

export const getTracker = async (req, res, next) => {
  try {
    const tracker = await gpaService.getTracker(req.user._id);
    res.json({ success: true, data: { tracker } });
  } catch (error) { next(error); }
};

export const addEntry = async (req, res, next) => {
  try {
    const tracker = await gpaService.addEntry(req.user._id, req.body);
    res.json({ success: true, data: { tracker } });
  } catch (error) { next(error); }
};

export const removeEntry = async (req, res, next) => {
  try {
    const tracker = await gpaService.removeEntry(req.user._id, parseInt(req.params.index));
    res.json({ success: true, data: { tracker } });
  } catch (error) { next(error); }
};

export const updateEntry = async (req, res, next) => {
  try {
    const tracker = await gpaService.updateEntry(req.user._id, parseInt(req.params.index), req.body);
    res.json({ success: true, data: { tracker } });
  } catch (error) { next(error); }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await gpaService.getStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

export const setTargetGpa = async (req, res, next) => {
  try {
    const tracker = await gpaService.setTargetGpa(req.user._id, req.body.targetGpa);
    res.json({ success: true, data: { targetGpa: tracker.targetGpa } });
  } catch (error) { next(error); }
};
