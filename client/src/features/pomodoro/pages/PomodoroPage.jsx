import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Timer,
  SkipForward,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import pomodoroService from "../../../services/pomodoro.service";

const PRESETS = {
  focus: { duration: 25 * 60, label: "Focus", icon: Brain, color: "#ef4444" },
  "short-break": { duration: 5 * 60, label: "Short Break", icon: Coffee, color: "#10b981" },
  "long-break": { duration: 15 * 60, label: "Long Break", icon: Coffee, color: "#3b82f6" },
};

export default function PomodoroPage() {
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(PRESETS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [task, setTask] = useState("");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef(null);
  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: pomodoroService.logSession,
    onSuccess: () => {
      queryClient.invalidateQueries(["pomodoro-stats"]);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["pomodoro-stats"],
    queryFn: () => pomodoroService.getStats({ days: 7 }).then((r) => r.data.data),
  });

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);

      if (mode === "focus") {
        logMutation.mutate({ type: "focus", duration: PRESETS.focus.duration / 60, task });
        setCompletedPomodoros((c) => c + 1);
        toast.success("Focus session complete! Time for a break.");

        if ((completedPomodoros + 1) % 4 === 0) {
          switchMode("long-break");
        } else {
          switchMode("short-break");
        }
      } else {
        toast.success("Break over! Ready to focus?");
        switchMode("focus");
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(PRESETS[newMode].duration);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(PRESETS[mode].duration);
  };

  const skip = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (mode === "focus") {
      switchMode("short-break");
    } else {
      switchMode("focus");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = PRESETS[mode].duration;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pomodoro Timer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Stay focused, take breaks</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 justify-center">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === key
                ? "text-white shadow-md"
                : "bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
            style={mode === key ? { backgroundColor: preset.color } : {}}
          >
            <preset.icon className="w-4 h-4" />
            {preset.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="280" height="280" className="-rotate-90">
            <circle cx="140" cy="140" r="120" fill="none"
              stroke="currentColor" strokeWidth="8"
              className="text-gray-100 dark:text-dark-border" />
            <circle cx="140" cy="140" r="120" fill="none"
              stroke={PRESETS[mode].color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {PRESETS[mode].label}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="btn-secondary p-3 rounded-full" title="Reset">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTimer}
          className="p-4 rounded-full text-white shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: PRESETS[mode].color }}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button onClick={skip} className="btn-secondary p-3 rounded-full" title="Skip">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Task Input */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          What are you working on?
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Study Chapter 5, Write essay..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats?.totalSessions || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sessions (7d)</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats?.totalMinutes || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Minutes (7d)</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{completedPomodoros}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Today</div>
        </div>
      </div>

      {/* Weekly Chart */}
      {stats?.dailyData && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">This Week</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.dailyData.map((day) => {
              const maxMinutes = Math.max(...stats.dailyData.map((d) => d.minutes), 1);
              const height = (day.minutes / maxMinutes) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">{day.minutes}m</span>
                  <div className="w-full rounded-t bg-primary-500/20 relative" style={{ height: `${Math.max(height, 4)}%` }}>
                    <div className="absolute bottom-0 w-full rounded-t bg-primary-500" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
