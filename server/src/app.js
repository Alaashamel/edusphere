import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import { config } from "./config/index.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import noteRoutes from "./routes/note.routes.js";
import calendarRoutes from "./routes/calendar.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import studyGroupRoutes from "./routes/studyGroup.routes.js";
import communityRoutes from "./routes/community.routes.js";
import marketplaceRoutes from "./routes/marketplace.routes.js";
import pomodoroRoutes from "./routes/pomodoro.routes.js";
import gpaRoutes from "./routes/gpa.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import fileRoutes from "./routes/file.routes.js";
import eventRoutes from "./routes/event.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "EduSphere API is running", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/gpa", gpaRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
