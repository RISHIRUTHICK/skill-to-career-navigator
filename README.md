# SkillPath – Skill-to-Career Navigator

[![SkillPath CI](https://github.com/RISHIRUTHICK/skill-to-career-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/RISHIRUTHICK/skill-to-career-navigator/actions/workflows/ci.yml)

**SkillPath** is a full-stack career guidance web application that analyzes a user's education, technical skills, experience, problem-solving ability, career interests, and goals to recommend a suitable technology career path.

It also provides a career-readiness score, personalized learning roadmap, roadmap progress tracking, secure authentication, profile management, and persistent user data.

---

## 🌐 Live Application

**Frontend**

https://skill-to-career-navigator.vercel.app

**Backend API**

https://skillpath-api-j0fl.onrender.com

**API Health Check**

https://skillpath-api-j0fl.onrender.com/api/health

> The backend is hosted on Render. The first request after a period of inactivity may take a little longer while the service starts.

---

## ✨ Key Features

- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Protected frontend routes and protected API endpoints
- Six-step career assessment
- Career recommendation engine
- Career-readiness score
- Strength and skill-gap analysis
- Personalized career roadmap
- Roadmap completion tracking
- Persistent assessment and roadmap data
- Career dashboard
- Profile editing
- Password change
- Account deletion
- localStorage fallback and assessment synchronization
- Responsive desktop, tablet, and mobile UI
- Production deployment with Vercel, Render, and MongoDB Atlas

---

## 🧠 Career Assessment

The assessment evaluates six areas:

1. Education
2. Technical Skills
3. Experience
4. Problem-Solving Ability
5. Career Interest
6. Career Goal

The user's answers are analyzed to produce a recommended career path and readiness score.

Current recommendation categories include:

- Software Developer
- Web Developer
- Data / AI Engineer
- Cloud / DevOps Engineer
- Cybersecurity Analyst

---

## 📊 Career Analysis

After completing the assessment, users receive:

- Recommended career
- Career-readiness percentage
- Existing strengths
- Skills to improve
- Assessment summary
- Suggested next action
- Personalized learning-roadmap entry point

The saved result is also used by the Dashboard and Roadmap pages.

---

## 🗺️ Personalized Roadmap

Each supported career path includes a structured learning roadmap.

Users can:

- View roadmap phases
- Mark individual skills as completed
- Track phase progress
- Track overall roadmap progress
- Continue progress across sessions
- Restore saved progress after refreshing or logging in again

Roadmap progress is stored in MongoDB and also supported by localStorage for improved reliability.

---

## 📈 Career Dashboard

The dashboard provides a central view of the user's career journey.

It displays:

- Recommended career
- Career-readiness score
- Technical-skills summary
- Career goal
- Problem-solving level
- Roadmap progress
- Completed roadmap items
- Recommended next action
- Quick access to career analysis and roadmap

---

## 👤 Account Management

Users can:

- Create an account
- Log in securely
- Stay authenticated with JWT
- Edit their profile name
- Change their password
- Log out
- Permanently delete their account

Deleting an account also removes the user's associated:

- Assessments
- Roadmap progress
- User account record

---

## 🔐 Security

SkillPath includes several production-focused security measures:

- bcrypt password hashing
- JWT authentication
- Protected API endpoints
- Protected frontend routes
- Helmet security headers
- Global API rate limiting
- Authentication-specific rate limiting
- CORS restrictions
- JSON request-size limits
- Environment-variable protection
- Password verification for sensitive actions
- User-specific database queries
- Safe deterministic email validation
- GitHub CodeQL code scanning
- GitHub Secret Scanning
- Dependabot vulnerability alerts
- Dependabot automated dependency updates
- Least-privilege GitHub Actions permissions

Sensitive values such as MongoDB credentials and JWT secrets are stored using environment variables and are not committed to the repository.

---

## 🧪 Automated Testing

The project includes automated frontend and backend test suites.

### Frontend

Tools:

- Vitest
- React Testing Library
- Testing Library DOM
- Testing Library User Event
- jsdom

Coverage includes:

- Registration
- Login
- Protected routes
- Assessment flow
- Assessment submission
- Results
- Dashboard
- Roadmap
- Profile
- Core SkillPath behavior

Run frontend tests:

```bash
cd client
npm run test:run -- --maxWorkers=1
```

### Backend

Tools:

- Vitest
- Supertest
- MongoDB Memory Server

Coverage includes:

- Health endpoint
- Registration
- Login
- Account/profile management
- Assessment APIs
- Roadmap APIs

Run backend tests:

```bash
cd server
npm run test:run -- --maxWorkers=1
```

---

## ⚙️ Continuous Integration

GitHub Actions automatically validates changes pushed to `main` and pull requests targeting `main`.

The CI workflow runs:

### Frontend

1. Install dependencies with `npm ci`
2. Run frontend tests
3. Run ESLint
4. Build the production frontend

### Backend

1. Install dependencies with `npm ci`
2. Run backend API tests

The protected `main` branch requires the important CI checks to pass before pull requests are merged.

---

## 🤖 Dependency & Security Automation

The repository uses Dependabot to monitor both npm projects:

- `/client`
- `/server`

Dependabot runs weekly and creates pull requests for dependency updates.

Security monitoring also includes:

- Dependabot vulnerability alerts
- Dependabot security updates
- CodeQL scanning for JavaScript/TypeScript and GitHub Actions
- Secret scanning for committed credentials

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React
- Recharts
- Fetch API
- localStorage
- Vitest
- React Testing Library
- ESLint

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- JSON Web Token
- Helmet
- express-rate-limit
- CORS
- dotenv
- Vitest
- Supertest
- MongoDB Memory Server

### DevOps / Deployment

- Git
- GitHub
- GitHub Actions
- Dependabot
- CodeQL
- Vercel
- Render
- MongoDB Atlas

---

## 🏗️ Application Architecture

```text
User
 │
 ▼
React + Vite Frontend
(Vercel)
 │
 │ HTTPS API Requests
 ▼
Node.js + Express Backend
(Render)
 │
 │ Mongoose
 ▼
MongoDB Atlas
```

---

## 📁 Project Structure

```text
skill-to-career-navigator/
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── dependabot.yml
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Pages/
│   │   │   ├── Assessment.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Roadmap.jsx
│   │   ├── test/
│   │   │   ├── Assessment.test.jsx
│   │   │   ├── AssessmentSubmission.test.jsx
│   │   │   ├── Dashboard.test.jsx
│   │   │   ├── Login.test.jsx
│   │   │   ├── Profile.test.jsx
│   │   │   ├── ProtectedRoute.test.jsx
│   │   │   ├── Register.test.jsx
│   │   │   ├── Results.test.jsx
│   │   │   ├── Roadmap.test.jsx
│   │   │   ├── SkillPath.test.jsx
│   │   │   └── setup.js
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── careerAnalysis.js
│   │   │   ├── roadmapProgress.js
│   │   │   └── syncAssessment.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Assessment.js
│   │   ├── RoadmapProgress.js
│   │   └── User.js
│   ├── test/
│   │   ├── account.test.js
│   │   ├── assessment.test.js
│   │   ├── health.test.js
│   │   ├── login.test.js
│   │   ├── register.test.js
│   │   └── roadmap.test.js
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/RISHIRUTHICK/skill-to-career-navigator.git
cd skill-to-career-navigator
```

### 2. Frontend setup

```bash
cd client
npm install
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

### 3. Backend setup

Open another terminal:

```bash
cd server
npm install
```

Create:

```text
server/.env
```

Add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Never commit the real `.env` file.

Start the backend:

```bash
npm run dev
```

The backend normally runs at:

```text
http://localhost:5000
```

---

## 🔌 API Endpoints

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
DELETE /api/auth/account
```

### Assessment

```text
POST /api/assessments
GET  /api/assessments/latest
```

### Roadmap Progress

```text
GET /api/roadmap-progress
PUT /api/roadmap-progress
```

### System

```text
GET /api/health
```

Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## 💾 Database Collections

SkillPath uses MongoDB collections for:

- Users
- Assessments
- Roadmap Progress

Assessment and roadmap records are associated with the authenticated user's MongoDB ID so one user cannot access another user's career data through the protected API.

---

## 🌍 Production Environment

### Vercel

Frontend environment variable:

```env
VITE_API_URL=https://skillpath-api-j0fl.onrender.com
```

### Render

Backend environment variables:

```env
MONGODB_URI=your_production_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://skill-to-career-navigator.vercel.app
```

Production backend installation uses runtime dependencies only:

```bash
npm ci --omit=dev
```

---

## 🔄 Development & Deployment Workflow

The project follows a pull-request-based workflow:

```text
Create feature/fix branch
        ↓
Make changes
        ↓
Run local tests
        ↓
Commit and push
        ↓
Create GitHub Pull Request
        ↓
GitHub Actions CI
        ↓
CodeQL / security checks
        ↓
Merge into protected main
        ↓
Vercel / Render deployment
```

Direct development changes are not merged into `main` until the required CI checks pass.

---

## 📱 Responsive Design

SkillPath is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The UI uses responsive layouts, flexible cards, adaptive controls, and mobile-friendly navigation.

---

## 🔮 Future Improvements

Potential future additions include:

- Email verification
- Forgot-password / password-reset flow
- More career paths
- AI-powered career recommendations
- Dynamic roadmap generation
- Learning-resource recommendations
- Course recommendations
- Job recommendations
- Resume analysis
- Advanced skill-gap visualization
- Assessment history
- Career comparison
- Administrative dashboard
- Custom user avatars
- Dark/light theme switching
- Analytics and monitoring

---

## 🎯 Project Purpose

SkillPath was built to solve a practical career-guidance problem while demonstrating end-to-end full-stack engineering skills.

The project demonstrates experience with:

- Frontend development
- Backend development
- REST API design
- Authentication and authorization
- Database design
- Password security
- API security
- State management
- Responsive UI development
- Automated testing
- Continuous integration
- Dependency management
- Security scanning
- Git and GitHub workflows
- Environment configuration
- Cloud database deployment
- Frontend deployment
- Backend deployment
- Production integration

---

## 👨‍💻 Author

**RISHIRUTHICK**

GitHub:

https://github.com/RISHIRUTHICK

---

## ⭐ Support

If you find the project useful, consider giving the repository a ⭐ on GitHub.
