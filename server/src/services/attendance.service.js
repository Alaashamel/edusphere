import Attendance from "../models/Attendance.model.js";

class AttendanceService {
  async getOrCreate(user, courseId) {
    let attendance = await Attendance.findOne({ user, course: courseId });
    if (!attendance) {
      attendance = await Attendance.create({ user, course: courseId, records: [] });
    }
    return attendance;
  }

  async markAttendance(user, courseId, records) {
    const attendance = await this.getOrCreate(user, courseId);
    for (const record of records) {
      const existingIdx = attendance.records.findIndex(
        (r) => new Date(r.date).toISOString() === new Date(record.date).toISOString()
      );
      if (existingIdx >= 0) {
        attendance.records[existingIdx] = { ...attendance.records[existingIdx].toObject(), ...record };
      } else {
        attendance.records.push(record);
      }
    }
    await attendance.save();
    return attendance;
  }

  async removeRecord(user, courseId, date) {
    const attendance = await Attendance.findOne({ user, course: courseId });
    if (!attendance) return null;
    attendance.records = attendance.records.filter(
      (r) => new Date(r.date).toISOString() !== new Date(date).toISOString()
    );
    await attendance.save();
    return attendance;
  }

  async getAttendanceByCourse(user, courseId) {
    return Attendance.findOne({ user, course: courseId }).populate("course", "name color");
  }

  async getAllAttendance(user) {
    const records = await Attendance.find({ user }).populate("course", "name color");
    return records.map((a) => ({
      course: a.course,
      totalSessions: a.totalSessions,
      presentCount: a.presentCount,
      percentage: a.attendancePercentage,
      records: a.records,
    }));
  }

  async getStats(user) {
    const all = await Attendance.find({ user }).populate("course", "name color");

    const courseStats = all.map((a) => {
      const total = a.records.length;
      const present = a.records.filter((r) => r.status === "present").length;
      const late = a.records.filter((r) => r.status === "late").length;
      const absent = a.records.filter((r) => r.status === "absent").length;
      const excused = a.records.filter((r) => r.status === "excused").length;
      const percentage = total === 0 ? 0 : Math.round(((present + late + excused) / total) * 100);

      return {
        courseId: a.course._id,
        courseName: a.course.name,
        courseColor: a.course.color,
        totalSessions: total,
        present,
        late,
        absent,
        excused,
        percentage,
        isLow: percentage < 75,
      };
    });

    const totalSessions = courseStats.reduce((sum, c) => sum + c.totalSessions, 0);
    const totalPresent = courseStats.reduce((sum, c) => sum + c.present + c.late + c.excused, 0);
    const overallPercentage = totalSessions === 0 ? 0 : Math.round((totalPresent / totalSessions) * 100);

    const recentRecords = all
      .flatMap((a) =>
        a.records.map((r) => ({ ...r.toObject(), course: a.course, courseId: a.course._id }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    return {
      courseStats,
      overallPercentage,
      totalSessions,
      warnings: courseStats.filter((c) => c.isLow),
      recentRecords,
    };
  }

  async getAttendanceByDateRange(user, startDate, endDate) {
    const all = await Attendance.find({ user }).populate("course", "name color");
    const results = [];

    for (const a of all) {
      for (const r of a.records) {
        const recordDate = new Date(r.date);
        if (recordDate >= new Date(startDate) && recordDate <= new Date(endDate)) {
          results.push({
            ...r.toObject(),
            course: a.course,
            courseId: a.course._id,
          });
        }
      }
    }

    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

export default new AttendanceService();
