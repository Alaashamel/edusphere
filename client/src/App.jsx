import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import LoadingScreen from "./components/ui/LoadingScreen";
import CommandPalette from "./components/CommandPalette";

const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./features/auth/pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./features/auth/pages/VerifyEmailPage"));
const OAuthCallbackPage = lazy(() => import("./features/auth/pages/OAuthCallbackPage"));
const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));
const CoursesPage = lazy(() => import("./features/courses/pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./features/courses/pages/CourseDetailPage"));
const AssignmentsPage = lazy(() => import("./features/assignments/pages/AssignmentsPage"));
const AssignmentDetailPage = lazy(() => import("./features/assignments/pages/AssignmentDetailPage"));
const NotesPage = lazy(() => import("./features/notes/pages/NotesPage"));
const NoteDetailPage = lazy(() => import("./features/notes/pages/NoteDetailPage"));
const CalendarPage = lazy(() => import("./features/calendar/pages/CalendarPage"));
const AIAssistantPage = lazy(() => import("./features/ai/pages/AIAssistantPage"));
const ChatPage = lazy(() => import("./features/chat/pages/ChatPage"));
const StudyGroupsPage = lazy(() => import("./features/studyGroups/pages/StudyGroupsPage"));
const StudyGroupDetailPage = lazy(() => import("./features/studyGroups/pages/StudyGroupDetailPage"));
const CommunityPage = lazy(() => import("./features/community/pages/CommunityPage"));
const PostDetailPage = lazy(() => import("./features/community/pages/PostDetailPage"));
const MarketplacePage = lazy(() => import("./features/marketplace/pages/MarketplacePage"));
const PomodoroPage = lazy(() => import("./features/pomodoro/pages/PomodoroPage"));
const GpaPage = lazy(() => import("./features/gpa/pages/GpaPage"));
const AttendancePage = lazy(() => import("./features/attendance/pages/AttendancePage"));
const FilesPage = lazy(() => import("./features/files/pages/FilesPage"));
const EventsPage = lazy(() => import("./features/events/pages/EventsPage"));
const AnalyticsPage = lazy(() => import("./features/analytics/pages/AnalyticsPage"));
const GamificationPage = lazy(() => import("./features/gamification/pages/GamificationPage"));
const NotificationsPage = lazy(() => import("./features/notifications/pages/NotificationsPage"));
const AdminPage = lazy(() => import("./features/admin/pages/AdminPage"));
const SettingsPage = lazy(() => import("./features/auth/pages/SettingsPage"));

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [paletteOpen]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/:id" element={<NoteDetailPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/study-groups" element={<StudyGroupsPage />} />
                <Route path="/study-groups/:id" element={<StudyGroupDetailPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/:id" element={<PostDetailPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/pomodoro" element={<PomodoroPage />} />
                <Route path="/gpa" element={<GpaPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/gamification" element={<GamificationPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
