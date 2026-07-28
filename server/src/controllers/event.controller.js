import eventService from "../services/event.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.user._id, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { search, type, startDate, endDate, tags, page, limit } = req.query;
    const result = await eventService.getEvents({ search, type, startDate, endDate, tags, page: parseInt(page) || 1, limit: parseInt(limit) || 20 });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await eventService.getMyEvents(req.user._id);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.user._id, req.body);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventService.deleteEvent(req.params.id, req.user._id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const event = await eventService.register(req.params.id, req.user._id);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const event = await eventService.cancelRegistration(req.params.id, req.user._id);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const events = await eventService.getUpcoming(req.user._id);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getCalendarEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const events = await eventService.getCalendarEvents(req.user._id, startDate, endDate);
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};
