import Notification from "../models/Notification.model.js";

class NotificationService {
  async create(userId, type, title, message = "", link = "", metadata = {}) {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });
    return notification;
  }

  async getAll(userId, query = {}) {
    const { page = 1, limit = 20, type, read } = query;
    const filter = { user: userId };

    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === "true";

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
      Notification.getUnreadCount(userId),
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.markAllAsRead(userId);
  }

  async delete(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });
    return notification;
  }

  async deleteAll(userId) {
    await Notification.deleteMany({ user: userId });
  }

  async getUnreadCount(userId) {
    return Notification.getUnreadCount(userId);
  }

  async createBulk(userIds, type, title, message = "", link = "", metadata = {}) {
    const notifications = await Notification.insertMany(
      userIds.map((userId) => ({
        user: userId,
        type,
        title,
        message,
        link,
        metadata,
      }))
    );
    return notifications;
  }
}

export default new NotificationService();
