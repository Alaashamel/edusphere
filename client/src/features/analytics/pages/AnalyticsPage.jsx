import { useQuery } from "@tanstack/react-query";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Brain,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Loader2,
  TrendingUp,
  TrendingDown,
  Flame,
} from "lucide-react";
import analyticsService from "../../../services/analytics.service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

function StatCard({ icon: Icon, label, value, sub, trend, color }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.getAll().then((r) => r.data.data),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  const { focus, gpa, attendance, assignments, courses } = data || {};

  const focusChartData = {
    labels: focus?.daily?.slice(-14).map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }) || [],
    datasets: [{
      label: "Focus Minutes",
      data: focus?.daily?.slice(-14).map((d) => d.minutes) || [],
      backgroundColor: "rgba(99, 102, 241, 0.5)",
      borderColor: "#6366f1",
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const gpaChartData = {
    labels: gpa?.semesterTrend?.map((s) => s.semester) || [],
    datasets: [{
      label: "GPA",
      data: gpa?.semesterTrend?.map((s) => s.gpa) || [],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#6366f1",
      pointRadius: 5,
    }],
  };

  const attendanceChartData = {
    labels: attendance?.courseRates?.map((c) => c.courseName) || [],
    datasets: [{
      label: "Attendance %",
      data: attendance?.courseRates?.map((c) => c.rate) || [],
      backgroundColor: attendance?.courseRates?.map((c) => c.color + "80") || [],
      borderColor: attendance?.courseRates?.map((c) => c.color) || [],
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const statusChartData = {
    labels: ["Completed", "In Progress", "Pending", "Overdue"],
    datasets: [{
      data: [
        assignments?.completed || 0,
        assignments?.inProgress || 0,
        assignments?.pending || 0,
        assignments?.overdue || 0,
      ],
      backgroundColor: ["#22c55e", "#3b82f6", "#eab308", "#ef4444"],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Your academic performance at a glance</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Focus Time" value={`${Math.round((focus?.totalMinutes || 0) / 60)}h ${focus?.totalMinutes % 60}m`}
          sub={`${focus?.totalSessions || 0} sessions`} color="bg-primary-500" />
        <StatCard icon={Target} label="Overall GPA" value={gpa?.overallGpa?.toFixed(2) || "—"}
          sub={`${gpa?.totalCredits || 0} credits`}
          trend={gpa?.semesterTrend?.length > 1 ? ((gpa.semesterTrend[gpa.semesterTrend.length - 1].gpa - gpa.semesterTrend[0].gpa) / gpa.semesterTrend[0].gpa) * 100 : undefined}
          color="bg-green-500" />
        <StatCard icon={Brain} label="Attendance" value={`${attendance?.overall || 0}%`}
          sub={`${attendance?.totalCourses || 0} courses`} color="bg-blue-500" />
        <StatCard icon={BookOpen} label="Assignments" value={`${assignments?.completionRate || 0}%`}
          sub={`${assignments?.completed || 0}/${assignments?.total || 0} done`} color="bg-purple-500" />
      </div>

      {/* Focus Streak */}
      {focus?.streak > 0 && (
        <div className="card bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{focus.streak} Day Streak!</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Keep it going! You've focused every day.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus Time Chart */}
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Focus Time (Last 14 Days)</h3>
          <div className="h-64">
            <Bar data={focusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } }, x: { grid: { display: false } } },
              }} />
          </div>
        </div>

        {/* GPA Trend */}
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">GPA Trend</h3>
          <div className="h-64">
            <Line data={gpaChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 4, grid: { color: "rgba(0,0,0,0.05)" } }, x: { grid: { display: false } } },
              }} />
          </div>
        </div>

        {/* Attendance by Course */}
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Attendance by Course</h3>
          <div className="h-64">
            <Bar data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, max: 100, grid: { color: "rgba(0,0,0,0.05)" } }, y: { grid: { display: false } } },
              }} />
          </div>
        </div>

        {/* Assignment Status */}
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Assignment Status</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-56">
              <Doughnut data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { padding: 16, usePointStyle: true } },
                  },
                  cutout: "65%",
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* Semester Breakdown */}
      {gpa?.semesterTrend?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Semester GPA Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">Semester</th>
                  <th className="pb-3 font-medium">GPA</th>
                  <th className="pb-3 font-medium">Credits</th>
                  <th className="pb-3 font-medium">Courses</th>
                </tr>
              </thead>
              <tbody>
                {gpa.semesterTrend.map((sem) => (
                  <tr key={sem.semester} className="border-b border-gray-100 dark:border-dark-border">
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">{sem.semester}</td>
                    <td className="py-3">
                      <span className={`font-bold ${sem.gpa >= 3.0 ? "text-green-600" : sem.gpa >= 2.0 ? "text-yellow-600" : "text-red-600"}`}>
                        {sem.gpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{sem.credits}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{sem.courses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Todo: Progress bar? */}
    </div>
  );
}
