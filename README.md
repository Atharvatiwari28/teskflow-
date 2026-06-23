# ⚡ TaskFlow — Project Management System

A full-stack project management application built with **React**, **Node.js**, **MongoDB**, and **Docker**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, react-hot-toast, date-fns |
| Backend | Node.js, Express 4, JWT auth, express-validator, Helmet, Morgan |
| Database | MongoDB 7 + Mongoose ODM |
| DevOps | Docker, Docker Compose, Nginx |

## Features

- 🔐 **User Authentication** — JWT-based register/login/logout with bcrypt hashing
- 📁 **Project Management** — Create, update, delete projects with status, priority, color, members
- ✅ **Task Management** — Kanban board (To Do → In Progress → Review → Done)
- 🎯 **Task Assignment** — Assign tasks to team members with due dates & priorities
- 🔍 **Search & Filter** — Filter by status, priority, search by text across tasks and projects
- 💬 **Comments** — Add/delete comments on tasks
- 👥 **Team Management** — View team members, roles, activity (admin can activate/deactivate)
- 🐳 **Docker** — Full containerization with compose for dev and prod
- 🛡️ **Security** — Rate limiting, CORS, Helmet headers, input validation

---

## Quick Start (Docker — recommended)

### Prerequisites
- Docker Desktop installed and running

### 1. Clone & configure
```bash
git clone <your-repo-url>
cd taskflow

# Copy and edit backend env
cp backend/.env.example backend/.env
# Edit backend/.env — change JWT_SECRET to a strong random string
```

### 2. Start everything
```bash
docker compose up --build
```

### 3. Open the app
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health check:** http://localhost:5000/health

Register a new account and start managing projects!

---

## Local Development (without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI=mongodb://localhost:27017/taskflow
npm run dev          # Starts on port 5000 with nodemon
```

### Frontend
```bash
cd frontend
npm install
npm start            # Starts on port 3000
```

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── projectController.js # CRUD + members + stats
│   │   │   ├── taskController.js    # CRUD + comments + my-tasks
│   │   │   └── userController.js    # Admin user management
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT protect + role authorize
│   │   │   └── errorHandler.js      # Centralized error handling
│   │   ├── models/
│   │   │   ├── User.js              # User schema + bcrypt hooks
│   │   │   ├── Project.js           # Project schema + virtuals
│   │   │   └── Task.js              # Task schema + indexes + comments
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   └── server.js                # Express app entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.js        # Sidebar + navigation
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── AuthPage.js          # Login + register
│   │   │   ├── Dashboard.js         # Overview + stats
│   │   │   ├── ProjectsPage.js      # Project list + CRUD
│   │   │   ├── ProjectDetailPage.js # Kanban board
│   │   │   ├── TasksPage.js         # My tasks list
│   │   │   └── TeamPage.js          # Team members
│   │   ├── styles/
│   │   │   └── global.css           # Dark theme design system
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance + all API calls
│   │   ├── App.js                   # Router + protected routes
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker/
│   └── mongo-init.js                # DB indexes on startup
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects (filterable) |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project + tasks |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |
| GET | `/api/projects/:id/stats` | Task status counts |
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task in project |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (filterable) |
| GET | `/api/tasks/my-tasks` | Tasks assigned to me |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| DELETE | `/api/tasks/:id/comments/:cid` | Delete comment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| PUT | `/api/users/:id` | Update user (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://mongo:27017/taskflow
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after code changes
docker compose up -d --build

# Stop all
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```
