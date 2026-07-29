import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  StickyNote,
  Calendar,
  Bot,
  MessageSquare,
  Users,
  MessageCircle,
  ShoppingBag,
  Timer,
  Calculator,
  ClipboardCheck,
  FolderOpen,
  CalendarDays,
  BarChart3,
  Trophy,
  Bell,
  Command,
  Search,
} from "lucide-react";

const COMMANDS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, keywords: "home main" },
  { id: "courses", label: "Courses", path: "/courses", icon: BookOpen, keywords: "classes subjects" },
  { id: "assignments", label: "Assignments", path: "/assignments", icon: FileText, keywords: "homework tasks" },
  { id: "notes", label: "Notes", path: "/notes", icon: StickyNote, keywords: "study notes" },
  { id: "calendar", label: "Calendar", path: "/calendar", icon: Calendar, keywords: "schedule events" },
  { id: "ai", label: "AI Assistant", path: "/ai", icon: Bot, keywords: "chatgpt help tutor" },
  { id: "chat", label: "Messages", path: "/chat", icon: MessageSquare, keywords: "chat direct messages" },
  { id: "study-groups", label: "Study Groups", path: "/study-groups", icon: Users, keywords: "group study" },
  { id: "community", label: "Forum", path: "/community", icon: MessageCircle, keywords: "discuss posts" },
  { id: "marketplace", label: "Marketplace", path: "/marketplace", icon: ShoppingBag, keywords: "buy sell books" },
  { id: "pomodoro", label: "Pomodoro Timer", path: "/pomodoro", icon: Timer, keywords: "focus timer" },
  { id: "gpa", label: "GPA Tracker", path: "/gpa", icon: Calculator, keywords: "grades calculator" },
  { id: "attendance", label: "Attendance", path: "/attendance", icon: ClipboardCheck, keywords: "present absent" },
  { id: "files", label: "Files", path: "/files", icon: FolderOpen, keywords: "documents upload" },
  { id: "events", label: "Events", path: "/events", icon: CalendarDays, keywords: "campus events" },
  { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3, keywords: "stats charts" },
  { id: "gamification", label: "Gamification", path: "/gamification", icon: Trophy, keywords: "xp badges levels" },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell, keywords: "alerts updates" },
];

const ACTIONS = [
  { id: "start-pomodoro", label: "Start Pomodoro", action: "pomodoro", path: "/pomodoro", keywords: "focus timer" },
  { id: "new-note", label: "Create Note", action: "note", path: "/notes", keywords: "write new note" },
  { id: "new-course", label: "Add Course", action: "course", path: "/courses", keywords: "new class" },
  { id: "view-calendar", label: "View Calendar", action: "calendar", path: "/calendar", keywords: "schedule" },
];

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const allItems = [...COMMANDS, ...ACTIONS];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    inputRef.current?.focus();
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const execute = useCallback(
    (item) => {
      onClose?.();
      if (item.path) {
        navigate(item.path);
      }
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      execute(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-dark-border">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-dark-surface text-gray-400 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          ) : (
            filtered.map((item, index) => (
              <button
                key={item.id}
                onClick={() => execute(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  index === selectedIndex
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="flex-1 text-left">{item.label}</span>
                {item.path && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                    {item.path}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-dark-border text-[10px] text-gray-400">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
