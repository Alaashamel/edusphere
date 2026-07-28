import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Plus,
  Trash2,
  Target,
  Loader2,
  X,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import gpaService from "../../../services/gpa.service";

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
const SEMESTERS = ["Spring", "Summer", "Fall"];

export default function GpaPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["gpa-stats"],
    queryFn: () => gpaService.getStats().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (index) => gpaService.removeEntry(index),
    onSuccess: () => {
      queryClient.invalidateQueries(["gpa-stats"]);
      toast.success("Entry removed");
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            GPA Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your academic performance</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.overallGpa?.toFixed(2) || "0.00"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Overall GPA</div>
          {stats?.targetGpa && (
            <div className={`text-xs mt-1 ${stats.overallGpa >= stats.targetGpa ? "text-green-500" : "text-red-500"}`}>
              Target: {stats.targetGpa.toFixed(2)}
            </div>
          )}
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.totalCredits || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Credits</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.totalCourses || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600">{stats?.semesterData?.length || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Semesters</div>
        </div>
      </div>

      {/* GPA Trend Chart */}
      {stats?.cumulativeGpaOverTime?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> GPA Trend
          </h3>
          <div className="flex items-end gap-3 h-40">
            {stats.cumulativeGpaOverTime.map((sem) => {
              const height = (sem.gpa / 4) * 100;
              return (
                <div key={sem.semester} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{sem.gpa.toFixed(2)}</span>
                  <div className="w-full rounded-t bg-primary-100 dark:bg-primary-900/30 relative" style={{ height: "100%" }}>
                    <div className="absolute bottom-0 w-full rounded-t bg-primary-500 transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 text-center leading-tight">{sem.semester}</span>
                </div>
              );
            })}
          </div>
          {stats.targetGpa && (
            <div className="relative mt-2">
              <div className="absolute w-full border-t-2 border-dashed border-red-400" style={{ bottom: `${(stats.targetGpa / 4) * 100}%` }}>
                <span className="absolute -top-5 right-0 text-xs text-red-500">Target: {stats.targetGpa}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Semester Breakdown */}
      {stats?.semesterData?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Semester Breakdown</h3>
          <div className="space-y-2">
            {stats.semesterData.map((sem) => (
              <div key={sem.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-surface">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{sem.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{sem.courses} courses, {sem.credits} credits</p>
                </div>
                <span className={`text-lg font-bold ${sem.gpa >= 3.0 ? "text-green-600" : sem.gpa >= 2.0 ? "text-yellow-600" : "text-red-600"}`}>
                  {sem.gpa.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course List */}
      {stats?.entries?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">All Courses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-2 font-medium">Course</th>
                  <th className="pb-2 font-medium">Grade</th>
                  <th className="pb-2 font-medium">Credits</th>
                  <th className="pb-2 font-medium">Semester</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {stats.entries.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-dark-border">
                    <td className="py-2">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{entry.courseName}</div>
                      {entry.courseCode && <div className="text-xs text-gray-500">{entry.courseCode}</div>}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        entry.gradePoints >= 3.0 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : entry.gradePoints >= 2.0 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}>{entry.grade}</span>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{entry.credits}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{entry.semester} {entry.year}</td>
                    <td className="py-2">
                      <button onClick={() => deleteMutation.mutate(i)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddCourseModal({ onClose }) {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    courseName: "",
    courseCode: "",
    credits: 3,
    grade: "A",
    semester: "Spring",
    year: currentYear,
  });

  const mutation = useMutation({
    mutationFn: gpaService.addEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(["gpa-stats"]);
      toast.success("Course added");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Course</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Name</label>
            <input type="text" className="input" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Code</label>
            <input type="text" className="input" placeholder="CS101" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Credits</label>
              <input type="number" min="0.5" max="10" step="0.5" className="input" value={form.credits} onChange={(e) => setForm({ ...form, credits: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Grade</label>
              <select className="input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
              <input type="number" min="2000" max="2100" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
            <select className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Add Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
