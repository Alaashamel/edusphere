import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import LoadingScreen from "./components/ui/LoadingScreen";

const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage"));
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

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
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
