import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    icon: { type: String, default: "🎯" },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    icon: { type: String, default: "🏆" },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
  },
  { _id: false }
);

const gamificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActive: Date,
    badges: [badgeSchema],
    achievements: [achievementSchema],
    xpHistory: [
      {
        amount: Number,
        source: {
          type: String,
          enum: ["focus", "assignment", "attendance", "login", "streak", "challenge", "course"],
        },
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

gamificationSchema.virtual("nextLevelXp").get(function () {
  return this.level * 500;
});

gamificationSchema.virtual("xpToNextLevel").get(function () {
  return Math.max(0, this.nextLevelXp - this.xp);
});

gamificationSchema.virtual("progress").get(function () {
  const prevXp = (this.level - 1) * 500;
  const currLevelXp = this.level * 500;
  return Math.min(1, (this.xp - prevXp) / (currLevelXp - prevXp));
});

gamificationSchema.virtual("title").get(function () {
  if (this.level >= 50) return "Grandmaster";
  if (this.level >= 30) return "Master";
  if (this.level >= 20) return "Expert";
  if (this.level >= 15) return "Scholar";
  if (this.level >= 10) return "Dedicated";
  if (this.level >= 5) return "Learner";
  return "Beginner";
});

const Gamification = mongoose.model("Gamification", gamificationSchema);

export default Gamification;
