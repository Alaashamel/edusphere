import GpaTracker from "../models/GpaTracker.model.js";

const GRADE_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

class GpaService {
  async getTracker(userId) {
    let tracker = await GpaTracker.findOne({ user: userId });
    if (!tracker) {
      tracker = await GpaTracker.create({ user: userId, entries: [] });
    }
    return tracker;
  }

  async addEntry(userId, data) {
    const tracker = await this.getTracker(userId);
    const gradePoints = data.gradePoints ?? GRADE_POINTS[data.grade] ?? 0;
    tracker.entries.push({ ...data, gradePoints });
    await tracker.save();
    return tracker;
  }

  async removeEntry(userId, index) {
    const tracker = await this.getTracker(userId);
    if (index < 0 || index >= tracker.entries.length) throw new Error("Invalid entry index");
    tracker.entries.splice(index, 1);
    await tracker.save();
    return tracker;
  }

  async updateEntry(userId, index, data) {
    const tracker = await this.getTracker(userId);
    if (index < 0 || index >= tracker.entries.length) throw new Error("Invalid entry index");
    const gradePoints = data.gradePoints ?? GRADE_POINTS[data.grade] ?? tracker.entries[index].gradePoints;
    tracker.entries[index] = { ...tracker.entries[index].toObject(), ...data, gradePoints };
    await tracker.save();
    return tracker;
  }

  async setTargetGpa(userId, targetGpa) {
    const tracker = await this.getTracker(userId);
    tracker.targetGpa = targetGpa;
    await tracker.save();
    return tracker;
  }

  calculateGpa(entries) {
    if (!entries.length) return 0;
    const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);
    if (totalCredits === 0) return 0;
    const totalPoints = entries.reduce((sum, e) => sum + e.gradePoints * e.credits, 0);
    return Math.round((totalPoints / totalCredits) * 100) / 100;
  }

  async getStats(userId) {
    const tracker = await this.getTracker(userId);
    const entries = tracker.entries;

    const overallGpa = this.calculateGpa(entries);
    const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);

    const semesters = {};
    entries.forEach((e) => {
      const key = `${e.semester} ${e.year}`;
      if (!semesters[key]) semesters[key] = [];
      semesters[key].push(e);
    });

    const semesterData = Object.entries(semesters)
      .map(([name, semEntries]) => ({
        name,
        gpa: this.calculateGpa(semEntries),
        credits: semEntries.reduce((sum, e) => sum + e.credits, 0),
        courses: semEntries.length,
      }))
      .sort((a, b) => {
        const [aSem, aYear] = a.name.split(" ");
        const [bSem, bYear] = b.name.split(" ");
        if (parseInt(aYear) !== parseInt(bYear)) return parseInt(aYear) - parseInt(bYear);
        const semOrder = { Spring: 0, Summer: 1, Fall: 2 };
        return (semOrder[aSem] || 0) - (semOrder[bSem] || 0);
      });

    const cumulativeGpaOverTime = [];
    let runningCredits = 0;
    let runningPoints = 0;
    semesterData.forEach((sem) => {
      runningCredits += sem.credits;
      runningPoints += sem.gpa * sem.credits;
      cumulativeGpaOverTime.push({
        semester: sem.name,
        gpa: Math.round((runningPoints / runningCredits) * 100) / 100,
      });
    });

    return {
      overallGpa,
      totalCredits,
      totalCourses: entries.length,
      semesterData,
      cumulativeGpaOverTime,
      targetGpa: tracker.targetGpa,
      entries,
    };
  }
}

export default new GpaService();
