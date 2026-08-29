import { useEffect } from "react";

import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Compass,
  Sparkles,
  Target,
} from "lucide-react";

import "./App.css";

import Assessment from "./Pages/Assessment";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Register from "./Pages/Register";
import Results from "./Pages/Results";
import Roadmap from "./Pages/Roadmap";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  syncPendingAssessment,
} from "./utils/syncAssessment";

/* ======================================
   CHECK SAVED ASSESSMENT
====================================== */

function hasValidAssessment() {
  try {
    const savedData =
      localStorage.getItem(
        "skillPathAssessment"
      );

    if (!savedData) {
      return false;
    }

    const parsedData =
      JSON.parse(savedData);

    return Boolean(
      parsedData &&
        typeof parsedData ===
          "object"
    );
  } catch (error) {
    console.error(
      "Unable to check saved assessment:",
      error
    );

    return false;
  }
}

/* ======================================
   CHECK LOGIN SESSION
====================================== */

function hasValidAuthSession() {
  try {
    const token =
      localStorage.getItem(
        "skillPathAuthToken"
      );

    const savedUser =
      localStorage.getItem(
        "skillPathUser"
      );

    if (
      !token ||
      !savedUser
    ) {
      return false;
    }

    const parsedUser =
      JSON.parse(savedUser);

    return Boolean(
      parsedUser &&
        typeof parsedUser ===
          "object" &&
        parsedUser.id
    );
  } catch (error) {
    console.error(
      "Unable to check login session:",
      error
    );

    return false;
  }
}

/* ======================================
   LANDING PAGE
====================================== */

function LandingPage() {
  const hasAssessment =
    hasValidAssessment();

  const isLoggedIn =
    hasValidAuthSession();

  const hasDashboardAccess =
    isLoggedIn &&
    hasAssessment;

  const goToAssessment = () => {
    window.location.href =
      "/assessment";
  };

  const goToDashboard = () => {
    window.location.href =
      "/dashboard";
  };

  const goToLogin = () => {
    window.location.href =
      "/login";
  };

  const goToRegister = () => {
    window.location.href =
      "/register";
  };

  const handlePrimaryAction =
    () => {
      if (!isLoggedIn) {
        goToRegister();
        return;
      }

      if (hasAssessment) {
        goToDashboard();
        return;
      }

      goToAssessment();
    };

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">

          <div className="logo-icon">
            <Compass
              size={21}
            />
          </div>

          <span>
            SkillPath
          </span>

        </div>

        <div className="nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

          {hasDashboardAccess && (
            <button
              type="button"
              className="nav-dashboard-link"
              onClick={
                goToDashboard
              }
            >
              Dashboard
            </button>
          )}

          {!isLoggedIn && (
            <button
              type="button"
              className="nav-dashboard-link"
              onClick={
                goToLogin
              }
            >
              Log In
            </button>
          )}

        </div>

        <button
          type="button"
          className="nav-button"
          onClick={
            handlePrimaryAction
          }
        >
          {!isLoggedIn
            ? "Create Account"
            : hasAssessment
            ? "My Dashboard"
            : "Get Started"}

          <ArrowRight
            size={17}
          />
        </button>

      </nav>

      {/* ================= MAIN ================= */}

      <main>

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-content">

            <div className="badge">

              <Sparkles
                size={15}
              />

              AI-powered career guidance

            </div>

            <h1>
              Turn your skills into

              <span>
                {" "}
                your career path.
              </span>
            </h1>

            <p>
              Discover what you're good
              at, identify the skills
              you're missing, and get a
              personalized roadmap to
              reach your dream career.
            </p>

            <div className="hero-actions">

              <button
                type="button"
                className="primary-button"
                onClick={
                  handlePrimaryAction
                }
              >
                {!isLoggedIn
                  ? "Create My Account"
                  : hasAssessment
                  ? "Open My Dashboard"
                  : "Discover My Career"}

                <ArrowRight
                  size={19}
                />
              </button>

              <a
                href="#features"
                className="secondary-button"
              >
                Explore Careers
              </a>

            </div>

          </div>

          {/* ================= CAREER CARD ================= */}

          <div className="career-preview">

            <div className="career-header">

              <div>

                <span className="eyebrow">
                  YOUR CAREER PATH
                </span>

                <h2>
                  Software Engineer
                </h2>

              </div>

              <div className="target-icon">

                <Target
                  size={22}
                />

              </div>

            </div>

            <div className="readiness">

              <div className="readiness-header">

                <span>
                  Career Readiness
                </span>

                <strong>
                  74%
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width:
                      "74%",
                  }}
                />

              </div>

            </div>

            <div className="skill-card">

              <div className="skill-icon">

                <Brain
                  size={21}
                />

              </div>

              <div className="skill-info">

                <strong>
                  Technical Skills
                </strong>

                <span>
                  Strong foundation
                </span>

              </div>

              <b>
                82%
              </b>

            </div>

            <div className="skill-card">

              <div className="skill-icon">

                <Briefcase
                  size={21}
                />

              </div>

              <div className="skill-info">

                <strong>
                  Projects
                </strong>

                <span>
                  Needs improvement
                </span>

              </div>

              <b>
                65%
              </b>

            </div>

            <div className="skill-card">

              <div className="skill-icon">

                <Target
                  size={21}
                />

              </div>

              <div className="skill-info">

                <strong>
                  Problem Solving
                </strong>

                <span>
                  Good progress
                </span>

              </div>

              <b>
                76%
              </b>

            </div>

            <div className="next-step">

              <div className="next-step-icon">

                <ArrowRight
                  size={19}
                />

              </div>

              <div>

                <span className="eyebrow">
                  NEXT RECOMMENDED STEP
                </span>

                <strong>
                  Master React &amp;
                  REST APIs
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ================= FEATURES ================= */}

        <section
          id="features"
          className="features"
        >

          <div className="section-heading">

            <span className="eyebrow">
              WHAT YOU GET
            </span>

            <h2>
              A clearer path from

              <span>
                {" "}
                skills to career.
              </span>
            </h2>

            <p>
              SkillPath helps you
              understand where you are
              today and what you should
              do next.
            </p>

          </div>

          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-icon">

                <Brain
                  size={22}
                />

              </div>

              <h3>
                Skill Analysis
              </h3>

              <p>
                Understand your
                strengths and identify
                the skills that need
                improvement.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">

                <Target
                  size={22}
                />

              </div>

              <h3>
                Career Matching
              </h3>

              <p>
                Discover career paths
                that match your
                interests, abilities
                and goals.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">

                <Briefcase
                  size={22}
                />

              </div>

              <h3>
                Skill Gap Detection
              </h3>

              <p>
                Find out exactly what
                you need to learn for
                your target career.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">

                <CheckCircle2
                  size={22}
                />

              </div>

              <h3>
                Personal Roadmap
              </h3>

              <p>
                Follow a practical
                step-by-step roadmap
                toward your chosen
                career.
              </p>

            </div>

          </div>

        </section>

        {/* ================= HOW IT WORKS ================= */}

        <section
          id="how-it-works"
          className="how-section"
        >

          <div className="section-heading">

            <span className="eyebrow">
              HOW IT WORKS
            </span>

            <h2>
              Your journey in

              <span>
                {" "}
                four simple steps.
              </span>
            </h2>

          </div>

          <div className="steps">

            <div className="step">

              <span>
                01
              </span>

              <h3>
                Tell us about yourself
              </h3>

              <p>
                Share your education,
                experience, skills and
                interests.
              </p>

            </div>

            <div className="step">

              <span>
                02
              </span>

              <h3>
                Analyze your skills
              </h3>

              <p>
                We'll identify your
                current strengths and
                skill gaps.
              </p>

            </div>

            <div className="step">

              <span>
                03
              </span>

              <h3>
                Choose your direction
              </h3>

              <p>
                Explore careers that
                align with your
                profile.
              </p>

            </div>

            <div className="step">

              <span>
                04
              </span>

              <h3>
                Follow your roadmap
              </h3>

              <p>
                Get actionable
                learning
                recommendations and
                next steps.
              </p>

            </div>

          </div>

        </section>

        {/* ================= ABOUT ================= */}

        <section
          id="about"
          className="about-section"
        >

          <div className="about-card">

            <div>

              <span className="eyebrow">
                ABOUT SKILLPATH
              </span>

              <h2>
                Stop guessing.
                <br />
                Start building.
              </h2>

            </div>

            <p>
              SkillPath is designed to
              help students and
              early-career
              professionals turn their
              existing skills into a
              clear, practical career
              direction.
            </p>

          </div>

        </section>

        {/* ================= CTA ================= */}

        <section className="final-cta">

          <div className="cta-content">

            <span className="eyebrow">

              {!isLoggedIn
                ? "CREATE YOUR SKILLPATH ACCOUNT"
                : hasAssessment
                ? "CONTINUE YOUR JOURNEY"
                : "READY TO START?"}

            </span>

            <h2>

              {!isLoggedIn
                ? "Save and continue your"
                : hasAssessment
                ? "Continue building your"
                : "Discover where your"}

              <span>

                {!isLoggedIn
                  ? " career journey."
                  : hasAssessment
                  ? " career path."
                  : " skills can take you."}

              </span>

            </h2>

            <p>

              {!isLoggedIn
                ? "Create an account to keep your career assessment, roadmap, and recommendations connected to you."
                : hasAssessment
                ? "Return to your dashboard to track your career readiness and roadmap progress."
                : "Take a short assessment and get your personalized career direction."}

            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handlePrimaryAction
              }
            >

              {!isLoggedIn
                ? "Create Account"
                : hasAssessment
                ? "Go to Dashboard"
                : "Start My Assessment"}

              <ArrowRight
                size={19}
              />

            </button>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer id="footer">

        <div className="footer-brand">

          <div className="logo">

            <div className="logo-icon">

              <Compass
                size={19}
              />

            </div>

            <span>
              SkillPath
            </span>

          </div>

          <p>
            Turn your skills into
            your career path.
          </p>

        </div>

        <div className="footer-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

          {hasDashboardAccess && (
            <button
              type="button"
              className="footer-dashboard-link"
              onClick={
                goToDashboard
              }
            >
              Dashboard
            </button>
          )}

          {!isLoggedIn && (
            <button
              type="button"
              className="footer-dashboard-link"
              onClick={
                goToLogin
              }
            >
              Log In
            </button>
          )}

        </div>

        <div className="footer-copy">
          © 2026 SkillPath. Built
          for better career
          decisions.
        </div>

      </footer>

    </div>
  );
}

/* ======================================
   APP ROUTING + AUTOMATIC SYNC
====================================== */

function App() {
  useEffect(() => {
    const attemptPendingSync =
      async () => {
        try {
          await syncPendingAssessment();
        } catch (error) {
          console.error(
            "Automatic assessment sync failed:",
            error
          );
        }
      };

    /*
      Attempt pending assessment
      synchronization immediately
      when SkillPath loads.
    */

    attemptPendingSync();

    /*
      Retry when the browser comes
      back online.
    */

    window.addEventListener(
      "online",
      attemptPendingSync
    );

    /*
      Retry every 30 seconds while
      SkillPath remains open.
    */

    const syncInterval =
      window.setInterval(
        attemptPendingSync,
        30000
      );

    return () => {
      window.removeEventListener(
        "online",
        attemptPendingSync
      );

      window.clearInterval(
        syncInterval
      );
    };
  }, []);

  /*
    Normalize paths.

    Example:

    /login/
       ↓
    /login
  */

  const currentPath =
    window.location.pathname ===
    "/"
      ? "/"
      : window.location.pathname.replace(
          /\/+$/,
          ""
        );

  // ======================================
  // PUBLIC AUTH ROUTES
  // ======================================

  if (
    currentPath ===
    "/register"
  ) {
    return (
      <Register />
    );
  }

  if (
    currentPath ===
    "/login"
  ) {
    return (
      <Login />
    );
  }

  // ======================================
  // PROTECTED SKILLPATH ROUTES
  // ======================================

  if (
    currentPath ===
    "/assessment"
  ) {
    return (
      <ProtectedRoute>

        <Assessment />

      </ProtectedRoute>
    );
  }

  if (
    currentPath ===
    "/results"
  ) {
    return (
      <ProtectedRoute>

        <Results />

      </ProtectedRoute>
    );
  }

  if (
    currentPath ===
    "/roadmap"
  ) {
    return (
      <ProtectedRoute>

        <Roadmap />

      </ProtectedRoute>
    );
  }

  if (
    currentPath ===
    "/dashboard"
  ) {
    return (
      <ProtectedRoute>

        <Dashboard />

      </ProtectedRoute>
    );
  }
  if (currentPath === "/profile") {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

  // ======================================
  // PUBLIC LANDING PAGE
  // ======================================

  return (
    <LandingPage />
  );
}

export default App;