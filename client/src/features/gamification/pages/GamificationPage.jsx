import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Zap,
  Flame,
  Medal,
  TrendingUp,
  Loader2,
  Star,
  Target,
  Crown,
  Users,
  Gift,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import toast from "react-hot-toast";
import gamificationService from "../../../services/gamification.service";

const LEVEL_TITLES = [
  { min: 0, title: "Beginner", icon: "🌱" },
  { min: 5, title: "Learner", icon: "📚" },
  { min: 10, title: "Dedicated", icon: "🎯" },
  { min: 15, title: "Scholar", icon: "📖" },
  { min: 20, title: "Expert", icon: "💡" },
  { min: 30, title: "Master", icon: "👑" },
  { min: 50, title: "Grandmaster", icon: "🌟" },
];

function getTitle(level) {
  return LEVEL_TITLES.filter((t) => level >= t.min).pop() || LEVEL_TITLES[0];
}

export default function GamificationPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("dashboard");

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["gamification"],
    queryFn: () => gamificationService.getStats().then((r) => r.data.data),
  });

  const { data: lbData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => gamificationService.getLeaderboard(50).then((r) => r.data.data),
  });

  const checkinMutation = useMutation({
    mutationFn: gamificationService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries(["gamification"]);
      queryClient.invalidateQueries(["leaderboard"]);
      toast.success("Daily check-in complete!");
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (!statsData) return null;

  const title = getTitle(statsData.level);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card bg-gradient-to-r from-primary-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl mb-2">{title.icon}</div>
            <h1 className="text-2xl font-bold">{title.title} Level {statsData.level}</h1>
            <p className="text-primary-100 mt-1">{statsData.title}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{statsData.xp.toLocaleString()}</div>
            <div className="text-primary-100 text-sm">XP</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-primary-100 mb-1">
            <span>Level {statsData.level}</span>
            <span>{statsData.xp} / {statsData.totalXpNextLevel} XP</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${statsData.xpProgress}%` }} />
          </div>
        </div>
        <button
          onClick={() => checkinMutation.mutate()}
          className="mt-4 bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
        >
          {checkinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Daily Check-in
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "dashboard", icon: Trophy, label: "Dashboard" },
          { id: "leaderboard", icon: Crown, label: "Leaderboard" },
          { id: "badges", icon: Medal, label: "Badges" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-surface"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab stats={statsData} />}
      {tab === "leaderboard" && <LeaderboardTab data={lbData || []} currentUserId={statsData.user} />}
      {tab === "badges" && <BadgesTab achievements={statsData.achievements || []} />}
    </div>
  );
}

function DashboardTab({ stats }) {
  const statsData = [
    { icon: Zap, label: "Level", value: stats.level, color: "bg-yellow-500" },
    { icon: Flame, label: "Current Streak", value: `${stats.streak} days`, color: "bg-orange-500" },
    { icon: Trophy, label: "Longest Streak", value: `${stats.longestStreak} days`, color: "bg-purple-500" },
    { icon: Star, label: "Badges", value: stats.achievements?.length || 0, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.xpHistory?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Recent XP
          </h3>
          <div className="space-y-2">
            {stats.xpHistory.slice(0, 10).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-dark-border last:border-0">
                <div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium capitalize">{entry.source?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500">{entry.description || entry.source}</p>
                </div>
                <span className="text-sm font-bold text-green-600">+{entry.amount} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.dailyStats && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Today's Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{stats.dailyStats.xpEarned || 0}</div>
              <div className="text-xs text-gray-500">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.dailyStats.focusMinutes || 0}</div>
              <div className="text-xs text-gray-500">Focus Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.dailyStats.assignmentsDone || 0}</div>
              <div className="text-xs text-gray-500">Assignments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardTab({ data, currentUserId }) {
  return (
    <div className="card">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Crown className="w-4 h-4 text-yellow-500" /> Global Leaderboard
      </h3>
      <div className="space-y-1">
        {data.map((entry, i) => (
          <div key={entry.user?._id || i}
            className={`flex items-center justify-between p-3 rounded-lg ${entry.user?._id === currentUserId ? "bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500" : "hover:bg-gray-50 dark:hover:bg-dark-surface"}`}>
            <div className="flex items-center gap-3">
              <span className={`w-8 text-center font-bold text-sm ${i < 3 ? "text-lg" : "text-gray-500"}`}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{entry.user?.name || "Anonymous"}</p>
                <p className="text-xs text-gray-500">Level {entry.level} · {entry.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary-600">{entry.xp.toLocaleString()}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesTab({ achievements }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((a) => (
          <div key={a.badge} className="card text-center">
            <div className="text-3xl mb-2">{a.badgeDetails?.icon || "🏆"}</div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.badgeDetails?.name || a.badge}</h4>
            <p className="text-xs text-gray-500 mt-1">{a.badgeDetails?.description || ""}</p>
            <p className="text-xs text-primary-500 mt-2">
              {new Date(a.earnedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No badges yet. Complete activities to earn badges!</p>
        </div>
      )}
    </div>
  );
}
