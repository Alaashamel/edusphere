import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { Link } from "react-router-dom";
import notificationService from "../../../services/notification.service";
import { getInitials } from "../../../utils/helpers";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationService.getUnreadCount();
      setUnreadCount(data.data.count);
    } catch {}
  };

  const toggleDropdown = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      try {
        const { data } = await notificationService.getAll({ limit: 10 });
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
    } catch {}
  };

  const typeIcons = {
    assignment: "📝",
    assignment_grade: "📊",
    chat_message: "💬",
    event: "📅",
    event_reminder: "⏰",
    study_group: "👥",
    forum: "📢",
    badge: "🎖️",
    level_up: "⬆️",
    streak: "🔥",
    system: "⚙️",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors ${
                    !notification.read ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {typeIcons[notification.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                          className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-border"
                          title="Mark as read"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
