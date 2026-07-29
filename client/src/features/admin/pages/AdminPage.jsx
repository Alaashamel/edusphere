import { useState, useEffect, useCallback } from "react";
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  BarChart3,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  UserCheck,
  Clock,
} from "lucide-react";
import adminService from "../../../services/admin.service";
import { formatDistanceToNow } from "date-fns";

const ROLE_COLORS = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  moderator: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  tutor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  student: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { setLoading(true); const { data } = await adminService.getStats(); setStats(data.data); } catch {} finally { setLoading(false); }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const params = { page: userPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role = roleFilter;
      const { data } = await adminService.getUsers(params);
      setUsers(data.data.users);
      setUserPagination(data.data.pagination);
    } catch {}
  }, [userPage, searchQuery, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isDisabled: !u.isDisabled } : u)));
    } catch {}
  };

  const handleRoleChange = async (id, role) => {
    try {
      await adminService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try { await adminService.deleteUser(id); setUsers((prev) => prev.filter((u) => u._id !== id)); } catch {}
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "moderation", label: "Moderation", icon: MessageSquare },
    { id: "activity", label: "Activity", icon: Clock },
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your platform</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-dark-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
            { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "bg-green-500" },
            { label: "Assignments", value: stats.totalAssignments, icon: FileText, color: "bg-orange-500" },
            { label: "Forum Posts", value: stats.totalPosts, icon: MessageSquare, color: "bg-purple-500" },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <card.icon className={`w-5 h-5 ${card.color.replace("bg-", "text-")}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-gray-900 dark:text-gray-100"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card rounded-lg text-gray-700 dark:text-gray-300"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-dark-border bg-transparent"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.isDisabled
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        }`}>
                          {user.isDisabled ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                            title={user.isDisabled ? "Enable" : "Disable"}
                          >
                            {user.isDisabled ? <ShieldOff className="w-4 h-4 text-green-500" /> : <Shield className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {userPagination && userPagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-border">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {userPagination.page} of {userPagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPagination.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setUserPage((p) => p + 1)}
                    disabled={userPagination.page >= userPagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "moderation" && <ModerationPanel />}
      {activeTab === "activity" && <ActivityPanel />}
    </div>
  );
}

function ModerationPanel() {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const { data } = await adminService.getModerationQueue(); setQueue(data.data); } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mt-8" />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Forum Posts ({queue?.recentPosts?.length || 0})</h3>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
          {queue?.recentPosts?.slice(0, 10).map((post) => (
            <div key={post._id} className="p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{post.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  by {post.author?.firstName} {post.author?.lastName} &middot; {post.type} &middot; {post.comments?.length || 0} comments
                </p>
              </div>
              <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                post.type === "announcement" ? "bg-yellow-100 text-yellow-700" : post.type === "question" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}>
                {post.type}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent Marketplace Items ({queue?.recentItems?.length || 0})</h3>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
          {queue?.recentItems?.slice(0, 10).map((item) => (
            <div key={item._id} className="p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  by {item.seller?.firstName} {item.seller?.lastName} &middot; ${item.price} &middot; {item.condition}
                </p>
              </div>
              <span className="ml-3 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 capitalize">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityPanel() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); const { data } = await adminService.getActivityLog(7); setLog(data.data); } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mt-8" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "New Users (7d)", value: log?.newUsers, icon: Users, color: "text-blue-600" },
          { label: "New Courses (7d)", value: log?.newCourses, icon: BookOpen, color: "text-green-600" },
          { label: "New Posts (7d)", value: log?.newPosts, icon: MessageSquare, color: "text-purple-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{card.value || 0}</p>
          </div>
        ))}
      </div>

      {log?.registrationsByDay?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Daily Registrations</h3>
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5">
            {log.registrationsByDay.map((day) => (
              <div key={day._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-24">{day._id}</span>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (day.count / Math.max(...log.registrationsByDay.map((d) => d.count))) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8 text-right">{day.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
