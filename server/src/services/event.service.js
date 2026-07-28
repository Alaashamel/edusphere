import Event from "../models/Event.model.js";

class EventService {
  async createEvent(userId, data) {
    return Event.create({ ...data, creator: userId });
  }

  async getEvents({ search, type, startDate, endDate, tags, page = 1, limit = 20 }) {
    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (tags) query.tags = { $in: tags.split(",") };
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate("creator", "name email avatar")
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getEventById(eventId) {
    return Event.findById(eventId).populate("creator", "name email avatar").populate("participants.user", "name email avatar");
  }

  async getMyEvents(userId) {
    const created = await Event.find({ creator: userId }).sort({ startDate: 1 });
    const registered = await Event.find({ "participants.user": userId, "participants.status": "registered" })
      .populate("creator", "name email avatar")
      .sort({ startDate: 1 });
    return { created, registered };
  }

  async updateEvent(eventId, userId, data) {
    const event = await Event.findOneAndUpdate(
      { _id: eventId, creator: userId },
      data,
      { new: true, runValidators: true }
    );
    return event;
  }

  async deleteEvent(eventId, userId) {
    const event = await Event.findOneAndDelete({ _id: eventId, creator: userId });
    return event;
  }

  async register(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    const existing = event.participants.find(
      (p) => p.user.toString() === userId && p.status !== "cancelled"
    );
    if (existing) throw new Error("Already registered");

    const cancelledIdx = event.participants.findIndex(
      (p) => p.user.toString() === userId && p.status === "cancelled"
    );

    if (cancelledIdx >= 0) {
      event.participants[cancelledIdx].status = "registered";
      event.participants[cancelledIdx].registeredAt = new Date();
    } else if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      event.participants.push({ user: userId, status: "waitlisted" });
    } else {
      event.participants.push({ user: userId, status: "registered" });
    }

    await event.save();
    return event;
  }

  async cancelRegistration(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    const participant = event.participants.find(
      (p) => p.user.toString() === userId && p.status !== "cancelled"
    );
    if (!participant) throw new Error("Not registered");

    participant.status = "cancelled";

    if (event.maxParticipants) {
      const waitlisted = event.participants.find((p) => p.status === "waitlisted");
      if (waitlisted) {
        waitlisted.status = "registered";
        waitlisted.registeredAt = new Date();
      }
    }

    await event.save();
    return event;
  }

  async getUpcoming(userId) {
    return Event.find({
      startDate: { $gte: new Date() },
      isPublished: true,
    })
      .populate("creator", "name email avatar")
      .sort({ startDate: 1 })
      .limit(10);
  }

  async getCalendarEvents(userId, startDate, endDate) {
    const query = {
      isPublished: true,
      $or: [
        { creator: userId },
        { "participants.user": userId },
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      ],
    };

    return Event.find(query)
      .populate("creator", "name email avatar")
      .sort({ startDate: 1 });
  }
}

export default new EventService();
