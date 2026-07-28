import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  StickyNote,
  Calendar,
  Timer,
  GraduationCap,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../utils/helpers";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Assignments", href: "/assignments", icon: ClipboardList },
  { name: "Notes", href: "/notes", icon: StickyNote },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Pomodoro", href: "/pomodoro", icon: Timer },
  { name: "GPA", href: "/gpa", icon: GraduationCap },
  { name: "Study Groups", href: "/groups", icon: Users },
  { name: "Chat", href: "/chat", icon: MessageCircle },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-dark-surface dark:hover:text-gray-100"
    );

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-dark-border">
        <span className="text-xl font-bold text-primary-600">EduSphere</span>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-surface"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink key={item.name} to={item.href} className={linkClass} onClick={onClose}>
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Secondary navigation */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-dark-border space-y-1">
        {secondaryNav.map((item) => (
          <NavLink key={item.name} to={item.href} className={linkClass} onClick={onClose}>
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/10 dark:hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-card">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
