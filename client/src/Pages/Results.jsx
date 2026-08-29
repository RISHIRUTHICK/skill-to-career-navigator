import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";

import "../App.css";
import { analyzeCareer } from "../utils/careerAnalysis";

function Results() {
  let answers = null;

  try {
    const savedData = localStorage.getItem(
      "skillPathAssessment"
    );

    if (savedData) {
      answers = JSON.parse(savedData);
    }
  } catch (error) {
    console.error(
      "Unable to read assessment data:",
      error
    );

    localStorage.removeItem(
      "skillPathAssessment"
    );
  }

  // =========================
  // NO ASSESSMENT DATA
  // =========================

  if (!answers) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-empty">
            <Target size={44} />

            <h1>
              No assessment data found.
            </h1>

            <p>
              Please complete the SkillPath career
              assessment before viewing your results.
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
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // CAREER ANALYSIS
  // =========================

  const analysis = analyzeCareer(answers);

  if (!analysis) {
    return (
      <div className="results-page">
        <div className="results-container">
          <div className="results-empty">
            <AlertTriangle size={44} />

            <h1>
              Unable to analyze your results.
            </h1>

            <p>
              Your assessment information may be
              incomplete. Please retake the
              assessment.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.location.href =
                  "/assessment";
              }}
            >
              Retake Assessment
              <ArrowRight size={18} />
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
    strengths,
    skillGaps,
  } = analysis;

  const handleRetake = () => {
    window.location.href = "/assessment";
  };

  return (
    <div className="results-page">
      <div className="results-container">

        {/* =========================
            TOP NAVIGATION
        ========================= */}

        <div className="results-topbar">
          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <ArrowLeft size={17} />
            Home
          </button>

          <div className="results-topbar-actions">

            <button
              type="button"
              className="dashboard-link-button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              Dashboard
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="retake-assessment-button"
              onClick={handleRetake}
            >
              <RefreshCw size={17} />
              <span>
                Retake Assessment
              </span>
            </button>

          </div>
        </div>

        {/* =========================
            RESULTS HEADER
        ========================= */}

        <div className="results-header">
          <span className="results-label">
            YOUR CAREER ANALYSIS
          </span>

          <h1>
            Your recommended path is
          </h1>

          <div className="recommended-career">
            <Target size={24} />
            {recommendedCareer}
          </div>

          <p>
            This recommendation is based on
            your technical skills, experience,
            problem-solving ability, career
            interests, and career goal.
          </p>
        </div>

        {/* =========================
            CAREER READINESS
        ========================= */}

        <div className="result-card readiness-card">
          <div className="result-card-heading">
            <div>
              <span>
                CAREER READINESS
              </span>

              <h2>
                {readinessScore}%
              </h2>
            </div>

            <TrendingUp size={28} />
          </div>

          <div className="result-progress">
            <div
              className="result-progress-fill"
              style={{
                width: `${readinessScore}%`,
              }}
            />
          </div>

          <p>
            Your readiness score estimates how
            closely your current profile matches
            the foundation required for{" "}
            {recommendedCareer}.
          </p>
        </div>

        {/* =========================
            STRENGTHS + SKILL GAPS
        ========================= */}

        <div className="results-grid">

          {/* Strengths */}
          <div className="result-card">
            <div className="result-title">
              <CheckCircle2 size={21} />

              <h3>
                Your Strengths
              </h3>
            </div>

            <div className="result-list">
              {strengths.map((strength) => (
                <div
                  key={strength}
                  className="result-list-item strength"
                >
                  <CheckCircle2 size={17} />
                  <span>
                    {strength}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div className="result-card">
            <div className="result-title">
              <AlertTriangle size={21} />

              <h3>
                Skills To Improve
              </h3>
            </div>

            <div className="result-list">
              {skillGaps.map((skill) => (
                <div
                  key={skill}
                  className="result-list-item gap"
                >
                  <AlertTriangle size={17} />
                  <span>
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* =========================
            ASSESSMENT SUMMARY
        ========================= */}

        <div className="result-card profile-summary">

          <div className="result-title">
            <Target size={21} />

            <h3>
              Your Assessment Summary
            </h3>
          </div>

          <div className="summary-grid">

            {/* Education */}
            <div className="summary-item">
              <div>
                <span>
                  Education
                </span>

                <strong>
                  {answers.education ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* Skills */}
            <div className="summary-item">
              <div>
                <span>
                  Technical Skills
                </span>

                <strong>
                  {skills.length}{" "}
                  {skills.length === 1
                    ? "skill selected"
                    : "skills selected"}
                </strong>
              </div>
            </div>

            {/* Experience */}
            <div className="summary-item">
              <div>
                <span>
                  Experience
                </span>

                <strong>
                  {answers.experience ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* Problem Solving */}
            <div className="summary-item">
              <div>
                <span>
                  Problem Solving
                </span>

                <strong>
                  {answers.problemSolving ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* Career Interest */}
            <div className="summary-item">
              <div>
                <span>
                  Career Interest
                </span>

                <strong>
                  {answers.careerInterest ||
                    "Not provided"}
                </strong>
              </div>
            </div>

            {/* Goal */}
            <div className="summary-item">
              <div>
                <span>
                  Career Goal
                </span>

                <strong>
                  {answers.goal ||
                    "Not provided"}
                </strong>
              </div>
            </div>

          </div>
        </div>

        {/* =========================
            NEXT STEP
        ========================= */}

        <div className="next-action-card">

          <span>
            NEXT RECOMMENDED STEP
          </span>

          <h2>
            Build your personalized roadmap
            for {recommendedCareer}
          </h2>

          <p>
            Your roadmap turns your skill gaps
            into a practical learning plan
            containing skills, projects, and
            career preparation milestones.
          </p>

          <div className="results-next-actions">

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                window.location.href =
                  "/roadmap";
              }}
            >
              View My Roadmap
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="dashboard-link-button"
              onClick={() => {
                window.location.href =
                  "/dashboard";
              }}
            >
              Open Dashboard
              <ArrowRight size={17} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Results;