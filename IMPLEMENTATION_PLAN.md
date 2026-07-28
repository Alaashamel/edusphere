# EduSphere — Implementation Plan

## Project Overview

**EduSphere** — The Operating System for Every Student

A unified platform replacing Google Calendar, Notion, Google Drive, Quizlet, Discord, Todoist, and ChatGPT for students.

---

## Environment Setup

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v24.13.0 | Runtime |
| npm | 11.5.2 | Package manager |
| Git | 2.53.0 | Version control |
| MongoDB Atlas | Latest | Database |
| Redis | Latest | Caching + Job queues |
| Cloudinary | Latest | File uploads |
| OpenAI API | Latest | AI features |
| GitHub | @Alaashamel | Repository hosting |

---

## Monorepo Structure

```
edusphere/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, fonts, icons
│   │   ├── components/              # Shared UI components
│   │   │   ├── ui/                  # Design system (Button, Input, Card, Modal, etc.)
│   │   │   ├── layout/              # Sidebar, Header, Footer, PageWrapper
│   │   │   └── shared/              # Reusable business components
│   │   ├── features/                # Feature modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── assignments/
│   │   │   ├── notes/
│   │   │   ├── calendar/
│   │   │   ├── pomodoro/
│   │   │   ├── gpa/
│   │   │   ├── attendance/
│   │   │   ├── ai/
│   │   │   ├── files/
│   │   │   ├── chat/
│   │   │   ├── study-groups/
│   │   │   ├── community/
│   │   │   ├── marketplace/
│   │   │   ├── events/
│   │   │   ├── notifications/
│   │   │   ├── analytics/
│   │   │   ├── gamification/
│   │   │   └── admin/
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── contexts/                # React contexts
│   │   ├── services/                # API service layer (Axios instances, API calls)
│   │   ├── utils/                   # Utility functions
│   │   ├── styles/                  # Global styles, Tailwind config
│   │   ├── validations/             # Zod schemas
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # DB, Redis, Cloudinary, OpenAI, env config
│   │   ├── controllers/             # Request handlers
│   │   ├── models/                  # Mongoose schemas
│   │   ├── routes/                  # Express routes
│   │   ├── middlewares/             # Auth, RBAC, rate-limit, upload, error
│   │   ├── validators/             # Zod/Joi validation schemas
│   │   ├── services/               # Business logic layer
│   │   ├── repositories/           # Data access layer
│   │   ├── jobs/                   # BullMQ job processors
│   │   ├── socket/                 # Socket.IO handlers
│   │   ├── utils/                  # Helpers, logger, email templates
│   │   └── app.js                  # Express app setup
│   ├── server.js                   # Entry point
│   ├── package.json
│   └── .env.example
│
├── docs/                           # Documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── deployment.md
│   ├── contributing.md
│   └── roadmap.md
│
├── .github/                        # GitHub config
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml              # Dev environment
├── .gitignore
├── .env.example                    # Root env template
├── LICENSE
└── README.md
```

---

## Database Schema (ER Diagram Summary)

### Core Models

```
User
├── _id, email, password, firstName, lastName, avatar, role
├── googleId, githubId (OAuth)
├── twoFactorSecret, twoFactorEnabled
├── isEmailVerified, emailVerificationToken
├── resetPasswordToken, resetPasswordExpire
├── xp, level, streak, badges[], achievements[]
├── createdAt, updatedAt

Course
├── _id, title, description, code, color, icon
├── instructor (ref User), semester, year
├── enrolledUsers[] (ref User), createdBy (ref User)
├── isActive, createdAt, updatedAt

Lecture
├── _id, course (ref Course), title, description
├── dayOfWeek, startTime, endTime, location
├── materials[], isRecurring, createdAt

Assignment
├── _id, course (ref Course), title, description
├── dueDate, priority, status, maxPoints
├── attachments[], submittedBy (ref User)
├── aiEstimatedDifficulty, aiEstimatedTime
├── createdBy (ref User), createdAt, updatedAt

Note
├── _id, title, content, contentMarkdown
├── folder (ref Folder), tags[], course (ref Course)
├── createdBy (ref User), isPinned, isArchived
├── versionHistory[], attachments[]
├── createdAt, updatedAt

Folder
├── _id, name, parent (ref Folder, self-ref)
├── course (ref Course), createdBy (ref User)
├── createdAt

CalendarEvent
├── _id, title, description, start, end
├── type (class|exam|deadline|reminder|custom)
├── course (ref Course), createdBy (ref User)
├── isRecurring, recurrenceRule
├── color, allDay, reminders[]
├── createdAt, updatedAt

PomodoroSession
├── _id, user (ref User), course (ref Course)
├── startTime, endTime, duration, type
├── completed, interruption, notes
├── createdAt

Grade
├── _id, student (ref User), course (ref Course)
├── assignment (ref Assignment), points, maxPoints
├── letterGrade, semester, year
├── gradedBy (ref User), createdAt

Attendance
├── _id, student (ref User), lecture (ref Lecture)
├── status (present|absent|late|excused)
├── date, note, createdAt

Message
├── _id, sender (ref User), receiver (ref User)
├── content, contentType, attachments[]
├── read, readAt, createdAt

ChatRoom
├── _id, participants[] (ref User)
├── isGroup, name, avatar
├── lastMessage (ref Message), createdAt

StudyGroup
├── _id, name, description, avatar
├── members[] (ref User, with role), creator (ref User)
├── tasks[], sharedFiles[], sharedCalendar[]
├── inviteCode, maxMembers
├── createdAt, updatedAt

CommunityPost
├── _id, author (ref User), title, content
├── type (post|question)
├── tags[], upvotes[], downvotes[]
├── bookmarks[], views
├── isResolved, isPinned
├── createdAt, updatedAt

CommunityComment
├── _id, post (ref CommunityPost), author (ref User)
├── content, upvotes[], downvotes[]
├── parentComment (ref, self-ref for replies)
├── isAcceptedAnswer, createdAt, updatedAt

MarketplaceItem
├── _id, seller (ref User), title, description
├── type (book|notes|device), price
├── images[], condition, category
├── isAvailable, isSold, location
├── ratings[], reviews[]
├── createdAt, updatedAt

Event
├── _id, title, description, location
├── startDate, endDate, organizer (ref User)
├── type, maxParticipants, registrations[]
├── requirements, prizes[]
├── image, createdAt, updatedAt

File
├── _id, name, originalName, mimeType, size
├── url, cloudinaryId, folder (ref Folder)
├── owner (ref User), sharedWith[]
├── tags[], isStarred, version
├── createdAt, updatedAt

Notification
├── _id, user (ref User), type, title, message
├── data (ref), read, readAt
├── createdAt

XPLog
├── _id, user (ref User), amount, reason
├── type (daily_streak|assignment|quiz|forum|study)
├── createdAt
```

### Indexes (Performance)

```javascript
// Compound indexes for common queries
User: { email: 1 }                    // unique
User: { googleId: 1 }                 // sparse
User: { githubId: 1 }                 // sparse

Course: { instructor: 1, isActive: 1 }
Course: { enrolledUsers: 1 }

Lecture: { course: 1, dayOfWeek: 1 }

Assignment: { course: 1, dueDate: 1 }
Assignment: { assignedTo: 1, status: 1 }

Note: { createdBy: 1, folder: 1 }
Note: { createdBy: 1, tags: 1 }
Note: { $text: { title: 'text', content: 'text' } }  // full-text search

CalendarEvent: { createdBy: 1, start: 1 }
CalendarEvent: { course: 1, start: 1 }

PomodoroSession: { user: 1, createdAt: -1 }

Message: { chatRoom: 1, createdAt: -1 }
Message: { sender: 1, receiver: 1 }

CommunityPost: { author: 1, type: 1, createdAt: -1 }
CommunityPost: { tags: 1, createdAt: -1 }  // trending
CommunityPost: { $text: { title: 'text', content: 'text' } }

MarketplaceItem: { type: 1, isAvailable: 1, createdAt: -1 }

Notification: { user: 1, read: 1, createdAt: -1 }

File: { owner: 1, folder: 1 }
```

---

## Milestones & Features Breakdown

### MILESTONE 1: Foundation (Weeks 1-2)

> **Goal:** Project scaffolding, authentication, core layout, and dashboard.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 1.1 | Initialize monorepo with client/server structure | `chore/init-monorepo` | P0 | infrastructure |
| 1.2 | Set up Express server with MongoDB, Redis, config, logging | `chore/server-setup` | P0 | infrastructure |
| 1.3 | Set up React + Vite client with Tailwind, routing, query client | `chore/client-setup` | P0 | infrastructure |
| 1.4 | Create User model and authentication (JWT, refresh tokens, register/login) | `feature/auth-basic` | P0 | auth, backend |
| 1.5 | Email verification and forgot/reset password flow | `feature/auth-email` | P0 | auth, backend |
| 1.6 | Google OAuth and GitHub OAuth login | `feature/auth-oauth` | P1 | auth, backend |
| 1.7 | Two-factor authentication (TOTP) | `feature/auth-2fa` | P2 | auth, backend |
| 1.8 | Auth pages UI (Login, Register, Forgot Password, Verify Email) | `feature/auth-ui` | P0 | auth, frontend |
| 1.9 | Design system — Button, Input, Card, Modal, Badge, etc. | `feature/design-system` | P0 | ui, frontend |
| 1.10 | App layout — Sidebar, Header, Responsive shell | `feature/app-layout` | P0 | ui, frontend |
| 1.11 | Personal Dashboard page | `feature/dashboard` | P0 | dashboard |
| 1.12 | RBAC middleware (Student, Tutor, Admin, Moderator) | `feature/rbac` | P0 | auth, security |
| 1.13 | Rate limiting, Helmet, compression, CORS | `feature/security-basics` | P0 | security |
| 1.14 | Docker Compose for local dev (MongoDB, Redis) | `feature/docker-dev` | P1 | infrastructure |
| 1.15 | GitHub Actions CI workflow (lint, test) | `feature/ci-setup` | P1 | infrastructure |

---

### MILESTONE 2: Academic Core (Weeks 3-4)

> **Goal:** Courses, Assignments, Notes, Calendar — the core academic tools.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 2.1 | Course CRUD (backend + frontend) | `feature/courses` | P0 | courses |
| 2.2 | Course enrollment and progress tracking | `feature/course-enrollment` | P0 | courses |
| 2.3 | Lectures management (schedule, materials) | `feature/lectures` | P1 | courses |
| 2.4 | Assignment CRUD with priority and status | `feature/assignments` | P0 | assignments |
| 2.5 | Assignment submission and grading | `feature/assignment-submission` | P0 | assignments |
| 2.6 | Rich text notes editor (Markdown, syntax highlighting) | `feature/notes-editor` | P0 | notes |
| 2.7 | Notes folders, tags, search, version history | `feature/notes-management` | P0 | notes |
| 2.8 | Calendar — Daily, Weekly, Monthly views | `feature/calendar-views` | P0 | calendar |
| 2.9 | Calendar — Drag & drop, recurring events, reminders | `feature/calendar-advanced` | P1 | calendar |
| 2.10 | GPA calculator and grade tracker | `feature/gpa` | P1 | gpa |
| 2.11 | Attendance tracking and reports | `feature/attendance` | P1 | attendance |

---

### MILESTONE 3: AI Integration (Weeks 5-6)

> **Goal:** Deep AI integration across the platform.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 3.1 | AI service layer (OpenAI integration, streaming) | `feature/ai-service` | P0 | ai |
| 3.2 | AI Chat Assistant (conversational, context-aware) | `feature/ai-chat` | P0 | ai |
| 3.3 | AI Quiz Generator from notes/PDFs | `feature/ai-quiz` | P0 | ai |
| 3.4 | AI Flashcard Generator | `feature/ai-flashcards` | P0 | ai |
| 3.5 | AI PDF Analyzer (summarize, extract, study plan) | `feature/ai-pdf` | P1 | ai |
| 3.6 | AI Study Planner (daily/weekly plans for exams) | `feature/ai-study-planner` | P1 | ai |
| 3.7 | AI Note Assistant (rewrite, summarize, translate, explain) | `feature/ai-note-assistant` | P1 | ai |
| 3.8 | AI Assignment helper (difficulty estimation, time estimates) | `feature/ai-assignment` | P2 | ai |
| 3.9 | AI Dashboard recommendations | `feature/ai-dashboard` | P2 | ai |

---

### MILESTONE 4: Collaboration & Communication (Weeks 7-8)

> **Goal:** Chat, Study Groups, Community — real-time collaboration.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 4.1 | Socket.IO server setup and connection management | `feature/socket-setup` | P0 | realtime |
| 4.2 | Private chat (real-time messaging, typing, read receipts) | `feature/chat` | P0 | chat |
| 4.3 | Chat UI (conversation list, message thread, file sharing) | `feature/chat-ui` | P0 | chat, frontend |
| 4.4 | Study Groups CRUD and management | `feature/study-groups` | P0 | groups |
| 4.5 | Study Groups — shared files, tasks, calendar | `feature/groups-collab` | P1 | groups |
| 4.6 | Community — posts, questions, answers, voting | `feature/community` | P0 | community |
| 4.7 | Community — comments, bookmarks, trending, moderation | `feature/community-advanced` | P1 | community |

---

### MILESTONE 5: Productivity & Files (Weeks 9-10)

> **Goal:** Pomodoro, Files, Notifications — boost productivity.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 5.1 | Pomodoro timer (study/break, focus mode) | `feature/pomodoro` | P0 | productivity |
| 5.2 | Pomodoro statistics and session history | `feature/pomodoro-stats` | P1 | productivity |
| 5.3 | File upload system (Cloudinary, folders, preview) | `feature/files` | P0 | files |
| 5.4 | File sharing, version history, search | `feature/files-advanced` | P1 | files |
| 5.5 | Notification system (realtime, in-app, email) | `feature/notifications` | P0 | notifications |
| 5.6 | Notification preferences and smart notifications | `feature/notification-prefs` | P2 | notifications |
| 5.7 | Global search (across all modules) | `feature/global-search` | P1 | search |

---

### MILESTONE 6: Engagement & Events (Weeks 11-12)

> **Goal:** Marketplace, Events, Gamification — engagement loops.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 6.1 | Marketplace CRUD (buy/sell books, notes, devices) | `feature/marketplace` | P0 | marketplace |
| 6.2 | Marketplace search, filters, reviews, ratings | `feature/marketplace-advanced` | P1 | marketplace |
| 6.3 | Events management (hackathons, workshops, etc.) | `feature/events` | P0 | events |
| 6.4 | Events registration and attendance | `feature/events-registration` | P1 | events |
| 6.5 | Gamification — XP, levels, streaks, badges, achievements | `feature/gamification` | P1 | gamification |
| 6.6 | Leaderboards and daily challenges | `feature/leaderboards` | P2 | gamification |

---

### MILESTONE 7: Analytics & Admin (Weeks 13-14)

> **Goal:** Analytics dashboards, Admin panel — power users and admins.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 7.1 | Analytics service (study hours, productivity, grades) | `feature/analytics-service` | P0 | analytics |
| 7.2 | Analytics dashboard UI with charts | `feature/analytics-ui` | P0 | analytics, frontend |
| 7.3 | Admin dashboard overview | `feature/admin-dashboard` | P0 | admin |
| 7.4 | Admin — user management, roles, permissions | `feature/admin-users` | P0 | admin |
| 7.5 | Admin — system settings, logs, reports | `feature/admin-settings` | P1 | admin |
| 7.6 | Admin — content moderation (community, marketplace) | `feature/admin-moderation` | P1 | admin |

---

### MILESTONE 8: Polish & Launch (Weeks 15-16)

> **Goal:** Dark mode, accessibility, performance, deployment, documentation.

| # | Issue Title | Branch | Priority | Labels |
|---|------------|--------|----------|--------|
| 8.1 | Dark mode / Light mode toggle with system preference | `feature/dark-mode` | P0 | ui |
| 8.2 | Command palette (Cmd+K) and keyboard shortcuts | `feature/command-palette` | P1 | productivity |
| 8.3 | PWA support (manifest, service worker, offline) | `feature/pwa` | P2 | mobile |
| 8.4 | Accessibility audit (WCAG 2.1 AA) | `feature/accessibility` | P1 | accessibility |
| 8.5 | Performance optimization (lazy load, code split, memoize) | `feature/performance` | P1 | performance |
| 8.6 | Comprehensive README and documentation | `docs/readme` | P0 | docs |
| 8.7 | API documentation (Swagger/OpenAPI) | `docs/api` | P1 | docs |
| 8.8 | Deployment config (Vercel + Render) | `feature/deployment` | P0 | infrastructure |
| 8.9 | Localization (Arabic RTL, English) | `feature/i18n` | P2 | i18n |
| 8.10 | Export features (PDF, CSV) | `feature/export` | P2 | productivity |

---

## Implementation Sequence

### Phase 1: Infrastructure & Auth (Milestone 1)

```
1.1 → 1.2 → 1.3 → 1.4 → 1.8 → 1.9 → 1.10 → 1.5 → 1.6 → 1.7 → 1.11 → 1.12 → 1.13 → 1.14 → 1.15
```

### Phase 2: Academic Core (Milestone 2)

```
2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 → 2.8 → 2.9 → 2.10 → 2.11
```

### Phase 3: AI (Milestone 3)

```
3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8 → 3.9
```

### Phase 4: Collaboration (Milestone 4)

```
4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7
```

### Phase 5: Productivity (Milestone 5)

```
5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7
```

### Phase 6: Engagement (Milestone 6)

```
6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6
```

### Phase 7: Admin & Analytics (Milestone 7)

```
7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6
```

### Phase 8: Polish (Milestone 8)

```
8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6 → 8.7 → 8.8 → 8.9 → 8.10
```

---

## Tech Stack Details

### Frontend Dependencies

| Package | Purpose |
|---------|---------|
| react, react-dom | UI library |
| vite | Build tool |
| react-router-dom | Client routing |
| @tanstack/react-query | Server state management |
| axios | HTTP client |
| react-hook-form | Form management |
| zod | Schema validation |
| @hookform/resolvers | RHQ + Zod integration |
| framer-motion | Animations |
| chart.js, react-chartjs-2 | Charts and graphs |
| socket.io-client | Real-time |
| @tiptap/react | Rich text editor |
| react-hot-toast | Notifications |
| lucide-react | Icons |
| clsx, tailwind-merge | Class utilities |
| date-fns | Date formatting |
| tailwindcss | Utility CSS |

### Backend Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| mongoose | MongoDB ODM |
| ioredis | Redis client |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| zod | Validation |
| socket.io | WebSocket server |
| bullmq | Job queues |
| cloudinary | File uploads |
| multer | Multipart parsing |
| nodemailer | Email sending |
| openai | AI integration |
| helmet | Security headers |
| cors | CORS |
| compression | Gzip |
| express-rate-limit | Rate limiting |
| morgan | HTTP logging |
| winston | App logging |
| dotenv | Env vars |
| express-mongo-sanitize | NoSQL injection |
| hpp | HTTP param pollution |
| xss-clean | XSS prevention |
| cron | Scheduled jobs |

---

## Git Workflow (Per Feature)

```
1. Create issue on GitHub
2. git checkout main && git pull
3. git checkout -b <branch-name>
4. Implement feature (multiple commits with conventional format)
5. git push -u origin <branch-name>
6. Create PR with template
7. Self-review and verify
8. Merge PR
9. Delete branch
10. Pull latest main
11. Continue to next issue
```

### Commit Format

```
<type>(<scope>): <description>

Types: feat, fix, refactor, docs, test, chore, style, perf
Scopes: auth, dashboard, courses, assignments, notes, calendar, 
        pomodoro, gpa, attendance, ai, files, chat, groups, 
        community, marketplace, events, notifications, analytics, 
        gamification, admin, ui, api, db, socket, config
```

---

## Environment Variables

### Server (.env)

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://...

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
FROM_NAME=EduSphere

# OpenAI
OPENAI_API_KEY=...

# Frontend URL for emails
FRONTEND_URL=http://localhost:5173
```

### Client (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=EduSphere
```

---

## Starting Point

**Issue 1.1: Initialize Monorepo**

This is where we begin — creating:
1. Root project structure
2. `client/` — Vite + React app
3. `server/` — Express + MongoDB app
4. Root `.gitignore`, `.env.example`, `README.md`
5. GitHub repository creation via `gh repo create`
6. Initial commit and push to `main`
