import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  X,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import attendanceService from "../../../services/attendance.service";
import courseService from "../../../services/course.service";

const STATUS_CONFIG = {
  present: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
  absent: { icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
  late: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  excused: { icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [showMark, setShowMark] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const { data: stats, isLoading } = useQuery({
    queryKey: ["attendance-stats"],
    queryFn: () => attendanceService.getStats().then((r) => r.data.data),
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseService.getAll().then((r) => r.data.data),
  });

  const { data: calendarRecords } = useQuery({
    queryKey: ["attendance-range", calendarDate.getFullYear(), calendarDate.getMonth()],
    queryFn: () => {
      const start = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
      const end = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
      return attendanceService.getByDateRange(start.toISOString(), end.toISOString()).then((r) => r.data.data);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();

  const getRecordsForDay = (day) => {
    if (!calendarRecords) return [];
    return calendarRecords.filter((r) => {
      const d = new Date(r.date);
      return d.getDate() === day && d.getMonth() === calendarDate.getMonth();
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary-500" />
            Attendance Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your class attendance</p>
        </div>
        <button onClick={() => setShowMark(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Mark Attendance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className={`text-3xl font-bold ${stats?.overallPercentage >= 75 ? "text-green-600" : "text-red-600"}`}>
            {stats?.overallPercentage || 0}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Overall Attendance</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.totalSessions || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Sessions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.courseStats?.length || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">{stats?.warnings?.length || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Low Attendance</div>
        </div>
      </div>

      {/* Warnings */}
      {stats?.warnings?.length > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
          <h3 className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" /> Attendance Warnings
          </h3>
          <div className="space-y-2">
            {stats.warnings.map((w) => (
              <div key={w.courseId} className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-400">{w.courseName}</span>
                <span className="font-bold text-red-600">{w.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Breakdown */}
      <div className="card">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Course Breakdown
        </h3>
        <div className="space-y-4">
          {stats?.courseStats?.map((c) => (
            <div key={c.courseId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.courseColor || "#6366f1" }} />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.courseName}</span>
                </div>
                <span className={`text-sm font-bold ${c.percentage >= 75 ? "text-green-600" : "text-red-600"}`}>
                  {c.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${c.percentage >= 75 ? "bg-green-500" : c.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(c.percentage, 100)}%` }}
                />
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-500">
                <span className="text-green-600">{c.present} present</span>
                <span className="text-yellow-600">{c.late} late</span>
                <span className="text-red-600">{c.absent} absent</span>
                <span className="text-blue-600">{c.excused} excused</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {calendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCalendarDate(new Date())} className="px-2 py-1 text-xs rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">Today</button>
            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const records = getRecordsForDay(day);
            return (
              <div key={day} className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface min-h-[48px]">
                <div className="font-medium text-gray-900 dark:text-gray-100">{day}</div>
                <div className="flex gap-0.5 justify-center flex-wrap mt-0.5">
                  {records.map((r, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[r.status]?.bg || "bg-gray-200"}`}
                      style={{ backgroundColor: STATUS_CONFIG[r.status]?.color?.replace("text-", "").includes("green") ? "#22c55e" : STATUS_CONFIG[r.status]?.color?.includes("red") ? "#ef4444" : STATUS_CONFIG[r.status]?.color?.includes("yellow") ? "#eab308" : "#3b82f6" }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records */}
      {stats?.recentRecords?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Recent Activity
          </h3>
          <div className="space-y-2">
            {stats.recentRecords.slice(0, 10).map((r, i) => {
              const cfg = STATUS_CONFIG[r.status];
              const Icon = cfg?.icon || CheckCircle2;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${cfg?.bg || "bg-gray-100"}`}>
                      <Icon className={`w-4 h-4 ${cfg?.color || "text-gray-500"}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.course?.name || "Course"}
                      </div>
                      {r.lectureTitle && <div className="text-xs text-gray-500">{r.lectureTitle}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-0.5 rounded ${cfg?.bg}`}>{r.status}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showMark && <MarkAttendanceModal courses={courses || []} onClose={() => setShowMark(false)} />}
    </div>
  );
}

function MarkAttendanceModal({ courses, onClose }) {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [entries, setEntries] = useState([{ status: "present", date: new Date().toISOString().split("T")[0], lectureTitle: "", notes: "" }]);

  const mutation = useMutation({
    mutationFn: attendanceService.mark,
    onSuccess: () => {
      queryClient.invalidateQueries(["attendance-stats"]);
      queryClient.invalidateQueries(["attendance-range"]);
      toast.success("Attendance marked");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const addEntry = () => {
    setEntries([...entries, { status: "present", date: new Date().toISOString().split("T")[0], lectureTitle: "", notes: "" }]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mark Attendance</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ courseId: selectedCourse, records: entries.map((e) => ({ ...e, date: new Date(e.date) })) });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course</label>
            <select className="input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
              <option value="">Select course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {entries.map((entry, i) => (
            <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-dark-surface space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Entry {i + 1}</span>
                {entries.length > 1 && (
                  <button type="button" onClick={() => removeEntry(i)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select className="input text-sm" value={entry.status} onChange={(e) => updateEntry(i, "status", e.target.value)}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input type="date" className="input text-sm" value={entry.date} onChange={(e) => updateEntry(i, "date", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Lecture Title</label>
                <input type="text" className="input text-sm" placeholder="Optional" value={entry.lectureTitle} onChange={(e) => updateEntry(i, "lectureTitle", e.target.value)} />
              </div>
            </div>
          ))}

          <button type="button" onClick={addEntry} className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-500">
            + Add Another Entry
          </button>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!selectedCourse || mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Mark Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
