import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  LayoutDashboard,
  LogOut,
  Map,
  RefreshCw,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import "../App.css";

import {
  getSavedUser,
  logoutUser,
  verifyAuthSession,
} from "../utils/auth";

import {
  analyzeCareer,
} from "../utils/careerAnalysis";

const TOTAL_ROADMAP_SKILLS = 16;

function Dashboard() {
  const [
    authChecking,
    setAuthChecking,
  ] = useState(true);

  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    getSavedUser()
  );

  // ======================================
  // VERIFY LOGIN SESSION
  // ======================================

  useEffect(() => {
    let isActive = true;

    const checkAuthentication =
      async () => {
        try {
          const result =
            await verifyAuthSession();

          if (!isActive) {
            return;
          }

          if (
            !result?.success ||
            !result?.user
          ) {
            window.location.replace(
              "/login"
            );

            return;
          }

          setCurrentUser(
            result.user
          );

          setAuthChecking(false);
        } catch (error) {
          console.error(
            "Dashboard authentication check failed:",
            error
          );

          if (isActive) {
            window.location.replace(
              "/login"
            );
          }
        }
      };

    checkAuthentication();

    return () => {
      isActive = false;
    };
  }, []);

  // ======================================
  // AUTH LOADING SCREEN
  // ======================================

  if (authChecking) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">

          <div className="dashboard-empty">

            <LayoutDashboard
              size={48}
            />

            <h1>
              Loading your dashboard...
            </h1>

            <p>
              Verifying your SkillPath
              account.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ======================================
  // LOAD ASSESSMENT + ROADMAP DATA
  // ======================================

  let answers = null;
  let roadmapProgress = [];

  try {
    const savedAssessment =
      localStorage.getItem(
        "skillPathAssessment"
      );

    if (savedAssessment) {
      answers =
        JSON.parse(
          savedAssessment
        );
    }

    const savedRoadmapProgress =
      localStorage.getItem(
        "skillPathRoadmapProgress"
      );

    if (
      savedRoadmapProgress
    ) {
      const parsedProgress =
        JSON.parse(
          savedRoadmapProgress
        );

      if (
        Array.isArray(
          parsedProgress
        )
      ) {
        roadmapProgress =
          parsedProgress;
      }
    }
  } catch (error) {
    console.error(
      "Unable to load dashboard data:",
      error
    );
  }

  // ======================================
  // ACTIONS
  // ======================================

  const handleProfile = () => {
    window.location.href =
      "/profile";
  };

  const handleRetake = () => {
    window.location.href =
      "/assessment";
  };

  const handleLogout = () => {
    logoutUser();
  };

  // ======================================
  // NO ASSESSMENT
  // ======================================

  if (!answers) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          <div className="dashboard-topbar">

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href =
                  "/";
              }}
            >
              <ArrowLeft
                size={17}
              />

              Home
            </button>

            <div className="dashboard-topbar-actions">

              <div className="dashboard-user-badge">

                <UserRound
                  size={17}
                />

                <span>
                  {currentUser?.name ||
                    "SkillPath User"}
                </span>

              </div>

              <button
                type="button"
                className="dashboard-retake-button"
                onClick={
                  handleProfile
                }
              >
                <UserRound
                  size={16}
                />

                Profile
              </button>

              <button
                type="button"
                className="dashboard-logout-button"
                onClick={
                  handleLogout
                }
              >
                <LogOut
                  size={16}
                />

                Log Out
              </button>

            </div>

          </div>

          <div className="dashboard-empty">

            <LayoutDashboard
              size={48}
            />

            <h1>
              Your dashboard is waiting.
            </h1>

            <p>
              Complete your SkillPath
              assessment first to unlock
              your personalized career
              dashboard.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.location.href =
                  "/assessment";
              }}
            >
              Start Assessment

              <ArrowRight
                size={18}
              />
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ======================================
  // CAREER ANALYSIS
  // ======================================

  const analysis =
    analyzeCareer(
      answers
    );

  if (!analysis) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-container">

          <div className="dashboard-topbar">

            <button
              type="button"
              className="back-button"
              onClick={() => {
                window.location.href =
                  "/";
              }}
            >
              <ArrowLeft
                size={17}
              />

              Home
            </button>

            <div className="dashboard-topbar-actions">

              <button
                type="button"
                className="dashboard-retake-button"
                onClick={
                  handleProfile
                }
              >
                <UserRound
                  size={16}
                />

                Profile
              </button>

              <button
                type="button"
                className="dashboard-logout-button"
                onClick={
                  handleLogout
                }
              >
                <LogOut
                  size={16}
                />

                Log Out
              </button>

            </div>

          </div>

          <div className="dashboard-empty">

            <Target
              size={48}
            />

            <h1>
              We couldn't build your
              dashboard.
            </h1>

            <p>
              Please retake the
              assessment so we can
              create your career
              profile again.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleRetake
              }
            >
              Retake Assessment
            </button>

          </div>

        </div>

      </div>
    );
  }

  const {
    recommendedCareer,
    readinessScore,
    skills,
    skillGaps,
  } = analysis;

  // ======================================
  // ROADMAP PROGRESS
  // ======================================

  const careerProgressPrefix =
    `${recommendedCareer}-`;

  const completedRoadmapSkills =
    roadmapProgress.filter(
      (id) =>
        typeof id ===
          "string" &&
        id.startsWith(
          careerProgressPrefix
        )
    ).length;

  const roadmapPercentage =
    TOTAL_ROADMAP_SKILLS === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (
              completedRoadmapSkills /
              TOTAL_ROADMAP_SKILLS
            ) * 100
          )
        );

  const nextRecommendedSkill =
    skillGaps[0] ||
    "Continue building projects";

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* ======================================
            TOP BAR
        ====================================== */}

        <div className="dashboard-topbar">

          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href =
                "/";
            }}
          >
            <ArrowLeft
              size={17}
            />

            Home
          </button>

          <div className="dashboard-topbar-actions">

            {/* USER */}

            <div className="dashboard-user-badge">

              <UserRound
                size={17}
              />

              <span>
                {currentUser?.name ||
                  "SkillPath User"}
              </span>

            </div>

            {/* PROFILE */}

            <button
              type="button"
              className="dashboard-retake-button"
              onClick={
                handleProfile
              }
            >
              <UserRound
                size={16}
              />

              Profile
            </button>

            {/* RETAKE */}

            <button
              type="button"
              className="dashboard-retake-button"
              onClick={
                handleRetake
              }
            >
              <RefreshCw
                size={16}
              />

              Retake Assessment
            </button>

            {/* LOGOUT */}

            <button
              type="button"
              className="dashboard-logout-button"
              onClick={
                handleLogout
              }
            >
              <LogOut
                size={16}
              />

              Log Out
            </button>

          </div>

        </div>

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="dashboard-header">

          <div className="dashboard-header-icon">

            <LayoutDashboard
              size={25}
            />

          </div>

          <span className="dashboard-label">
            YOUR CAREER DASHBOARD
          </span>

          <h1>
            Welcome back
            {currentUser?.name
              ? `, ${currentUser.name}`
              : ""}
            .
            <br />

            Keep moving toward your
            <strong>
              {" "}
              career goal.
            </strong>
          </h1>

          <p>
            Track your career
            readiness, roadmap
            progress, skills, and
            next recommended action
            in one place.
          </p>

        </div>

        {/* ======================================
            MAIN CAREER CARD
        ====================================== */}

        <div className="dashboard-career-card">

          <div>

            <span className="dashboard-small-label">
              RECOMMENDED CAREER
            </span>

            <h2>
              {recommendedCareer}
            </h2>

            <p>
              Based on your assessment
              profile and current
              technical foundation.
            </p>

          </div>

          <div className="dashboard-career-icon">

            <Target
              size={28}
            />

          </div>

        </div>

        {/* ======================================
            MAIN STATS
        ====================================== */}

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-heading">

              <div>

                <span>
                  CAREER READINESS
                </span>

                <h2>
                  {readinessScore}%
                </h2>

              </div>

              <TrendingUp
                size={24}
              />

            </div>

            <div className="dashboard-progress">

              <div
                className="dashboard-progress-fill"
                style={{
                  width:
                    `${readinessScore}%`,
                }}
              />

            </div>

            <p>
              How closely your current
              profile matches your
              recommended career.
            </p>

          </div>

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-heading">

              <div>

                <span>
                  ROADMAP PROGRESS
                </span>

                <h2>
                  {roadmapPercentage}%
                </h2>

              </div>

              <Map
                size={24}
              />

            </div>

            <div className="dashboard-progress">

              <div
                className="dashboard-progress-fill"
                style={{
                  width:
                    `${roadmapPercentage}%`,
                }}
              />

            </div>

            <p>
              {completedRoadmapSkills}{" "}
              of{" "}
              {TOTAL_ROADMAP_SKILLS}{" "}
              roadmap skills completed.
            </p>

          </div>

        </div>

        {/* ======================================
            SMALLER STATS
        ====================================== */}

        <div className="dashboard-info-grid">

          <div className="dashboard-info-card">

            <Code2
              size={22}
            />

            <div>

              <span>
                TECHNICAL SKILLS
              </span>

              <strong>
                {skills.length} selected
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <CheckCircle2
              size={22}
            />

            <div>

              <span>
                ROADMAP COMPLETED
              </span>

              <strong>
                {completedRoadmapSkills}
                {" / "}
                {TOTAL_ROADMAP_SKILLS}
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <Target
              size={22}
            />

            <div>

              <span>
                CAREER GOAL
              </span>

              <strong>
                {answers.goal ||
                  "Not selected"}
              </strong>

            </div>

          </div>

          <div className="dashboard-info-card">

            <TrendingUp
              size={22}
            />

            <div>

              <span>
                PROBLEM SOLVING
              </span>

              <strong>
                {answers.problemSolving ||
                  "Not selected"}
              </strong>

            </div>

          </div>

        </div>

        {/* ======================================
            NEXT ACTION
        ====================================== */}

        <div className="dashboard-next-card">

          <div className="dashboard-next-content">

            <span>
              NEXT RECOMMENDED ACTION
            </span>

            <h2>
              {nextRecommendedSkill}
            </h2>

            <p>
              Continue improving the
              skills that will have the
              greatest impact on your
              career readiness.
            </p>

          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              window.location.href =
                "/roadmap";
            }}
          >
            Continue Roadmap

            <ArrowRight
              size={18}
            />
          </button>

        </div>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <div className="dashboard-actions">

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() => {
              window.location.href =
                "/results";
            }}
          >
            <Target
              size={22}
            />

            <div>

              <strong>
                View Career Analysis
              </strong>

              <span>
                Review strengths and
                skill gaps.
              </span>

            </div>

            <ArrowRight
              size={18}
            />

          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() => {
              window.location.href =
                "/roadmap";
            }}
          >
            <Map
              size={22}
            />

            <div>

              <strong>
                Continue My Roadmap
              </strong>

              <span>
                Continue learning and
                track progress.
              </span>

            </div>

            <ArrowRight
              size={18}
            />

          </button>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;