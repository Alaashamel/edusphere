# EduSphere

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Language](https://img.shields.io/badge/language-JavaScript-informational.svg) ![Last Commit](https://img.shields.io/github/last-commit/Alaashamel/edusphere)


**The Operating System for Every Student**

EduSphere is a unified intelligent platform that replaces Google Calendar, Notion, Google Drive, Quizlet, Discord, Todoist, and ChatGPT — giving students one place to manage their entire academic life.

---

## Features

- **Dashboard** — Personal productivity overview, today's schedule, AI recommendations
- **Courses** — Enrollment, lectures, materials, progress tracking
- **Assignments** — Submission, grading, priority, AI difficulty estimation
- **Notes** — Rich text editor, markdown, folders, tags, version history
- **Calendar** — Daily/weekly/monthly views, drag & drop, recurring events
- **Pomodoro** — Study timer, focus mode, session history, statistics
- **GPA** — Semester/overall GPA tracking, grade prediction, charts
- **Attendance** — Tracking, percentage, warnings, reports
- **AI System** — Flashcards, quiz generation, study plans, PDF analysis, writing assistant
- **Files** — Cloud storage, folders, sharing, version history
- **Chat** — Real-time private messaging, typing indicators, read receipts
- **Study Groups** — Shared tasks, files, calendars, notes
- **Community** — Posts, Q&A, voting, trending, moderation
- **Marketplace** — Buy/sell books, notes, devices with reviews
- **Events** — Hackathons, workshops, competitions, registration
- **Gamification** — XP, levels, streaks, badges, leaderboards
- **Analytics** — Study hours, productivity, grades, attendance charts
- **Admin Panel** — User management, roles, system settings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, TanStack Query, Socket.IO Client |
| Backend | Node.js, Express.js, MongoDB, Mongoose, Redis, Socket.IO |
| AI | OpenAI API |
| Files | Cloudinary |
| Auth | JWT + Refresh Tokens, Google OAuth, GitHub OAuth, 2FA |
| Deployment | Docker, GitHub Actions, Vercel, Render |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Redis (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/Alaashamel/edusphere.git
cd edusphere

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start development servers
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### Environment Variables

See `.env.example` in the root directory for all required environment variables.

## Project Structure

```
edusphere/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Shared UI components
│       ├── features/        # Feature modules
│       ├── hooks/           # Custom React hooks
│       ├── contexts/        # React contexts
│       ├── services/        # API service layer
│       └── utils/           # Utility functions
├── server/                  # Express backend
│   └── src/
│       ├── config/          # Configuration
│       ├── controllers/     # Request handlers
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API routes
│       ├── middlewares/      # Middleware
│       ├── services/        # Business logic
│       ├── repositories/    # Data access layer
│       ├── jobs/            # Background jobs
│       └── socket/          # WebSocket handlers
├── docs/                    # Documentation
└── .github/                 # CI/CD workflows
```

## License

MIT

## Author

[@Alaashamel](https://github.com/Alaashamel)
