import CalendarEvent from "../models/CalendarEvent.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class CalendarService {
  async createEvent(data, userId) {
    const event = await CalendarEvent.create({
      ...data,
      createdBy: userId,
    });
    return event.populate("course", "title code color");
  }

  async getEventById(eventId, userId) {
    const event = await CalendarEvent.findOne({ _id: eventId, createdBy: userId })
      .populate("course", "title code color")
      .populate("attendees", "firstName lastName email avatar");
    if (!event) {
      throw new AppError("Event not found", 404);
    }
    return event;
  }

  async getUserEvents(userId, { start, end, type, courseId }) {
    const query = { createdBy: userId };

    if (start || end) {
      query.start = {};
      if (start) query.start.$gte = new Date(start);
      if (end) query.start.$lte = new Date(end);
    }
    if (type) query.type = type;
    if (courseId) query.course = courseId;

    return CalendarEvent.find(query)
      .populate("course", "title code color")
      .sort({ start: 1 });
  }

  async updateEvent(eventId, updateData, userId) {
    const event = await CalendarEvent.findOne({ _id: eventId, createdBy: userId });
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const allowedUpdates = [
      "title", "description", "start", "end", "allDay", "type",
      "course", "color", "location", "isRecurring", "recurrence",
      "reminders", "attendees",
    ];

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        event[key] = updateData[key];
      }
    }

    await event.save();
    return event.populate("course", "title code color");
  }

  async deleteEvent(eventId, userId) {
    const event = await CalendarEvent.findOneAndDelete({ _id: eventId, createdBy: userId });
    if (!event) {
      throw new AppError("Event not found", 404);
    }
    return true;
  }

  async getEventsByDateRange(userId, startDate, endDate) {
    return CalendarEvent.find({
      createdBy: userId,
      start: { $gte: startDate },
      end: { $lte: endDate },
    })
      .populate("course", "title code color")
      .sort({ start: 1 });
  }

  async getTodayEvents(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return CalendarEvent.find({
      createdBy: userId,
      start: { $gte: today, $lt: tomorrow },
    })
      .populate("course", "title code color")
      .sort({ start: 1 });
  }

  async getUpcomingEvents(userId, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return CalendarEvent.find({
      createdBy: userId,
      start: { $gte: now, $lte: future },
    })
      .populate("course", "title code color")
      .sort({ start: 1 });
  }
}

export default new CalendarService();
