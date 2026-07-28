import calendarService from "../services/calendar.service.js";

export const createEvent = async (req, res, next) => {
  try {
    const event = await calendarService.createEvent(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Event created", data: { event } });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await calendarService.getEventById(req.params.id, req.user._id);
    res.json({ success: true, data: { event } });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req, res, next) => {
  try {
    const events = await calendarService.getUserEvents(req.user._id, req.query);
    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await calendarService.updateEvent(req.params.id, req.body, req.user._id);
    res.json({ success: true, message: "Event updated", data: { event } });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await calendarService.deleteEvent(req.params.id, req.user._id);
    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    next(error);
  }
};

export const getTodayEvents = async (req, res, next) => {
  try {
    const events = await calendarService.getTodayEvents(req.user._id);
    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const events = await calendarService.getUpcomingEvents(req.user._id, days);
    res.json({ success: true, data: { events } });
  } catch (error) {
    next(error);
  }
};
