import PomodoroSession from "../models/PomodoroSession.model.js";
import GpaTracker from "../models/GpaTracker.model.js";
import Attendance from "../models/Attendance.model.js";
import Assignment from "../models/Assignment.model.js";
import Course from "../models/Course.model.js";

class AnalyticsService {
  async getFocusTime(userId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sessions = await PomodoroSession.find({
      user: userId,
      type: "focus",
      completed: true,
      completedAt: { $gte: since },
    }).sort({ completedAt: 1 });

    const dailyMap = {};
    for (const s of sessions) {
      const key = s.completedAt.toISOString().split("T")[0];
      dailyMap[key] = (dailyMap[key] || 0) + s.duration;
    }

    const daily = Object.entries(dailyMap).map(([date, minutes]) => ({ date, minutes }));
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDaily = daily.length > 0 ? Math.round(totalMinutes / daily.length) : 0;
    const totalSessions = sessions.length;

    let streak = 0;
    const sortedDates = Object.keys(dailyMap).sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    let check = today;
    for (const date of sortedDates) {
      if (date === check) {
        streak++;
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        check = d.toISOString().split("T")[0];
      } else break;
    }

    const weeklyMap = {};
    for (const s of sessions) {
      const d = new Date(s.completedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      weeklyMap[key] = (weeklyMap[key] || 0) + s.duration;
    }
    const weekly = Object.entries(weeklyMap).map(([week, minutes]) => ({ week, minutes }));

    return { daily, weekly, totalMinutes, avgDaily, totalSessions, streak };
  }

  async getGpaData(userId) {
    const tracker = await GpaTracker.findOne({ user: userId });
    if (!tracker || tracker.entries.length === 0) {
      return { overallGpa: 0, totalCredits: 0, semesterTrend: [], courseBreakdown: [] };
    }

    const entries = tracker.entries;
    const totalCredits = entries.reduce((s, e) => s + e.credits, 0);
    const totalPoints = entries.reduce((s, e) => s + e.gradePoints * e.credits, 0);
    const overallGpa = totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;

    const semesterMap = {};
    for (const e of entries) {
      const key = `${e.semester} ${e.year}`;
      if (!semesterMap[key]) semesterMap[key] = { credits: 0, points: 0, courses: [] };
      semesterMap[key].credits += e.credits;
      semesterMap[key].points += e.gradePoints * e.credits;
      semesterMap[key].courses.push({ name: e.courseName, grade: e.grade, credits: e.credits, gradePoints: e.gradePoints });
    }

    const semesterTrend = Object.entries(semesterMap).map(([sem, data]) => ({
      semester: sem,
      gpa: +(data.points / data.credits).toFixed(2),
      credits: data.credits,
      courses: data.courses.length,
    })).sort((a, b) => a.semester.localeCompare(b.semester));

    return { overallGpa, totalCredits, semesterTrend, targetGpa: tracker.targetGpa };
  }

  async getAttendanceData(userId) {
    const records = await Attendance.find({ user: userId }).populate("course", "name color");

    const courseRates = records.map((a) => {
      const total = a.records.length;
      const present = a.records.filter((r) => r.status === "present").length;
      const rate = total > 0 ? Math.round(((present + a.records.filter((r) => r.status === "late" || r.status === "excused").length) / total) * 100) : 0;
      return { courseName: a.course?.name || "Unknown", color: a.course?.color || "#6366f1", rate, total, present };
    });

    const overall = courseRates.length > 0
      ? Math.round(courseRates.reduce((s, c) => s + c.rate, 0) / courseRates.length)
      : 0;

    return { overall, courseRates, totalCourses: records.length };
  }

  async getAssignmentData(userId) {
    const assignments = await Assignment.find({ createdBy: userId });

    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === "graded" || a.status === "submitted").length;
    const inProgress = assignments.filter((a) => a.status === "in_progress").length;
    const pending = assignments.filter((a) => a.status === "pending").length;
    const overdue = assignments.filter((a) => a.isOverdue).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byPriority = {
      urgent: assignments.filter((a) => a.priority === "urgent").length,
      high: assignments.filter((a) => a.priority === "high").length,
      medium: assignments.filter((a) => a.priority === "medium").length,
      low: assignments.filter((a) => a.priority === "low").length,
    };

    const graded = assignments.filter((a) => a.submission?.grade?.points != null);
    const gradeDistribution = {
      A: graded.filter((a) => a.submission.grade.letterGrade === "A").length,
      B: graded.filter((a) => a.submission.grade.letterGrade === "B").length,
      C: graded.filter((a) => a.submission.grade.letterGrade === "C").length,
      D: graded.filter((a) => a.submission.grade.letterGrade === "D").length,
      F: graded.filter((a) => a.submission.grade.letterGrade === "F").length,
    };

    const monthlyMap = {};
    for (const a of assignments) {
      const key = a.createdAt.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, completed: 0 };
      monthlyMap[key].total++;
      if (a.status === "graded" || a.status === "submitted") monthlyMap[key].completed++;
    }

    const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      total: data.total,
      completed: data.completed,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return { total, completed, inProgress, pending, overdue, completionRate, byPriority, gradeDistribution, monthlyTrend };
  }

  async getCourseData(userId) {
    const courses = await Course.find({ students: userId });
    return { total: courses.length, courses: courses.map((c) => ({ name: c.name, color: c.color })) };
  }

  async getAll(userId) {
    const [focus, gpa, attendance, assignments, courses] = await Promise.all([
      this.getFocusTime(userId),
      this.getGpaData(userId),
      this.getAttendanceData(userId),
      this.getAssignmentData(userId),
      this.getCourseData(userId),
    ]);

    return { focus, gpa, attendance, assignments, courses };
  }
}

export default new AnalyticsService();
