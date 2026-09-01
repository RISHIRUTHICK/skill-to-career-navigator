# SkillPath – Skill-to-Career Navigator
[![SkillPath CI](https://github.com/RISHIRUTHICK/skill-to-career-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/RISHIRUTHICK/skill-to-career-navigator/actions/workflows/ci.yml)
SkillPath is a full-stack career guidance web application that analyzes a user's education, technical skills, experience, problem-solving ability, career interests, and goals to recommend a suitable technology career path.

The application also provides a personalized learning roadmap, career-readiness score, progress tracking, secure authentication, and account management.

---

## 🌐 Live Application

**Frontend**

https://skill-to-career-navigator.vercel.app

**Backend API**

https://skillpath-api-j0fl.onrender.com

**API Health Check**

https://skillpath-api-j0fl.onrender.com/api/health

> Note: The backend is hosted on Render's free instance. The first request after a period of inactivity may take some time while the service starts.

---

## 🚀 Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected application routes
- Six-step career assessment
- Career recommendation engine
- Career-readiness score
- Personalized career roadmap
- Roadmap progress tracking
- MongoDB cloud data persistence
- User-specific assessment data
- User-specific roadmap progress
- Offline/localStorage fallback
- Automatic pending assessment synchronization
- Career dashboard
- User profile page
- Edit profile
- Change password
- Delete account
- Responsive user interface
- Production API security
- Rate limiting
- Secure HTTP headers with Helmet
- CORS protection
- Production deployment with Vercel and Render

---

## 🧠 Career Assessment

SkillPath evaluates users using six areas:

1. Education
2. Technical Skills
3. Experience
4. Problem-Solving Ability
5. Career Interest
6. Career Goal

Based on the answers, the application analyzes the user's profile and recommends an appropriate career.

Current career recommendations include:

- Software Developer
- Web Developer
- Data / AI Engineer
- Cloud / DevOps Engineer
- Cybersecurity Analyst

---

## 📊 Career Readiness

After completing the assessment, SkillPath calculates a career-readiness score.

The results page provides:

- Recommended career
- Readiness percentage
- Existing strengths
- Skill gaps
- Suggested next action

The result is then used to create a personalized learning roadmap.

---

## 🗺️ Personalized Roadmap

Each recommended career contains a structured learning roadmap.

Users can:

- View roadmap phases
- Mark skills as completed
- Track overall progress
- View completed roadmap items
- Continue progress across sessions
- Restore progress after logging in again

Roadmap progress is stored in MongoDB and also supported by localStorage for improved reliability.

---

## 📈 Career Dashboard

The dashboard provides a central view of the user's career journey.

It displays:

- Recommended career
- Career-readiness score
- Assessment status
- Roadmap progress
- Completed roadmap items
- Career goal
- Quick navigation to results, roadmap, assessment, and profile

---

## 👤 Account Management

SkillPath includes a complete account-management system.

Users can:

- Create an account
- Log in securely
- Stay logged in using JWT authentication
- Edit their profile name
- Change their password
- Log out
- Permanently delete their account

Account deletion also removes the user's:

- Assessments
- Roadmap progress
- User account data

---

## 🔐 Security

The backend includes several production security measures:

- Password hashing with bcrypt
- JWT authentication
- Protected API endpoints
- Helmet security headers
- API rate limiting
- Authentication rate limiting
- CORS restrictions
- JSON request-size limits
- Environment-variable protection
- Password verification before sensitive actions
- User-specific database queries

Sensitive values such as the MongoDB connection string and JWT secret are stored using environment variables and are not committed to GitHub.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React
- Fetch API
- localStorage

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

### Deployment

- Vercel – Frontend
- Render – Backend API
- MongoDB Atlas – Cloud Database
- GitHub – Source Control

---

## 🏗️ Application Architecture

```text
User
 │
 ▼
React + Vite Frontend
Vercel
 │
 │ HTTPS API Requests
 ▼
Node.js + Express Backend
Render
 │
 │ Mongoose
 ▼
MongoDB Atlas
📁 Project Structure
skill-to-career-navigator/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── Pages/
│   │   │   ├── Assessment.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Roadmap.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── careerAnalysis.js
│   │   │   ├── roadmapProgress.js
│   │   │   └── syncAssessment.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Assessment.js
│   │   ├── RoadmapProgress.js
│   │   └── User.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
⚙️ Local Development Setup
1. Clone the repository
git clone https://github.com/RISHIRUTHICK/skill-to-career-navigator.git

Move into the project:

cd skill-to-career-navigator
2. Install frontend dependencies
cd client
npm install

Create:

client/.env

Add:

VITE_API_URL=http://localhost:5000

Start the frontend:

npm run dev

The frontend will normally run at:

http://localhost:5173
3. Install backend dependencies

Open another terminal:

cd server
npm install

Create:

server/.env

Add:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173

Never commit the real .env file.

Start the backend:

npm run dev

The backend will run at:

http://localhost:5000
🔌 API Endpoints
Authentication
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
DELETE /api/auth/account
Assessment
POST /api/assessments
GET  /api/assessments/latest
Roadmap Progress
GET /api/roadmap-progress
PUT /api/roadmap-progress
System
GET /api/health

Protected endpoints require:

Authorization: Bearer <JWT_TOKEN>
💾 Database Collections

SkillPath currently uses MongoDB collections for:

Users
Assessments
Roadmap Progress

Each assessment and roadmap record is associated with the authenticated user's MongoDB ID.

This prevents one user from accessing another user's career information.

🌍 Production Environment
Vercel

Frontend environment variable:

VITE_API_URL=https://skillpath-api-j0fl.onrender.com
Render

Backend environment variables:

MONGODB_URI=your_production_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://skill-to-career-navigator.vercel.app
📱 Responsive Design

SkillPath has been designed to work across:

Desktop
Laptop
Tablet
Mobile devices

The interface uses responsive grids, flexible cards, mobile navigation layouts, and adaptive assessment controls.

🔄 Deployment Workflow

The project uses GitHub-based continuous deployment.

Code Change
     ↓
Git Commit
     ↓
Git Push
     ↓
GitHub
   ↙     ↘
Vercel   Render
Frontend Backend

New pushes to the main branch can automatically trigger new deployments.

🔮 Future Improvements

Potential future additions include:

Email verification
Forgot-password / password-reset system
More career paths
AI-powered career recommendations
Dynamic roadmap generation
Learning-resource recommendations
Course recommendations
Job recommendations
Resume analysis
Skill-gap visualization
Assessment history
Career comparison
Administrative dashboard
Custom user avatars
Dark/light theme support
Automated testing
Analytics and monitoring
🎯 Project Purpose

SkillPath was created to demonstrate practical full-stack development skills while solving a real-world career-guidance problem.

The project demonstrates experience with:

Frontend development
Backend development
REST API development
Authentication
Authorization
Database design
Password security
API security
State management
Responsive UI development
Git and GitHub
Environment configuration
Cloud database deployment
Frontend deployment
Backend deployment
Full-stack production integration
👨‍💻 Author

RISHIRUTHICK

GitHub:

https://github.com/RISHIRUTHICK

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.


Save it with:

```text