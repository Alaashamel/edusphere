import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Filter,
  Loader2,
} from "lucide-react";
import notificationService from "../../../services/notification.service";
import { formatDistanceToNow } from "date-fns";

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Assignment", value: "assignment" },
  { label: "Chat", value: "chat_message" },
  { label: "Events", value: "event" },
  { label: "Badges", value: "badge" },
  { label: "System", value: "system" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter) params.type = filter;
      const { data } = await notificationService.getAll(params);
      setNotifications(
        page === 1
          ? data.data.notifications
          : (prev) => [...prev, ...data.data.notifications]
      );
      setPagination(data.data.pagination);
      setUnreadCount(data.data.unreadCount);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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
        prev.map((n) =>
          n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const deleted = notifications.find((n) => n._id === id);
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  const handleLoadMore = () => {
    if (pagination?.hasMore) {
      setPage((prev) => prev + 1);
    }
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter ? "No matching notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  !notification.read
                    ? "bg-primary-50/50 dark:bg-primary-900/10"
                    : ""
                }`}
              >
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {typeIcons[notification.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {notification.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification._id)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border text-gray-400 hover:text-primary-600"
                          title="Mark as read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination?.hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
