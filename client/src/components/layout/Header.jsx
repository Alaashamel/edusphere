import { Menu, Search, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getInitials } from "../../utils/helpers";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-surface rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-dark-border rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          <NotificationDropdown />

          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200 dark:border-dark-border">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
