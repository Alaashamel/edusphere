import { useAuth } from "../../../contexts/AuthContext";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Timer,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const stats = [
  { name: "Active Courses", value: "6", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { name: "Pending Tasks", value: "12", icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20" },
  { name: "Study Hours Today", value: "3.5h", icon: Timer, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
  { name: "GPA", value: "3.7", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20" },
];

const upcomingTasks = [
  { id: 1, title: "Data Structures Assignment", course: "CS201", due: "Tomorrow", priority: "high" },
  { id: 2, title: "Read Chapter 5-6", course: "MATH301", due: "In 3 days", priority: "medium" },
  { id: 3, title: "Lab Report Submission", course: "PHY101", due: "In 5 days", priority: "low" },
];

const todaySchedule = [
  { id: 1, time: "09:00 AM", title: "Data Structures", location: "Room 301", type: "lecture" },
  { id: 2, time: "11:00 AM", title: "Linear Algebra", location: "Room 205", type: "lecture" },
  { id: 3, time: "02:00 PM", title: "Physics Lab", location: "Lab 4", type: "lab" },
];

const priorityColors = {
  high: "badge-danger",
  medium: "badge-warning",
  low: "badge-success",
};

export default function DashboardPage() {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {greeting}, {user?.firstName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your studies today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Today&apos;s Schedule
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
              >
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400 w-20 shrink-0">
                  {item.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              Upcoming Tasks
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0 cursor-pointer hover:text-primary-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.course} &middot; Due {task.due}
                  </p>
                </div>
                <span className={priorityColors[task.priority]}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Start Pomodoro", icon: Timer, color: "text-red-500" },
            { label: "New Note", icon: ClipboardList, color: "text-blue-500" },
            { label: "View Calendar", icon: Calendar, color: "text-green-500" },
            { label: "AI Assistant", icon: TrendingUp, color: "text-purple-500" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
