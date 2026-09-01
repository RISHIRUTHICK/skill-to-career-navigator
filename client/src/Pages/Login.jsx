import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useState } from "react";

import "../App.css";

import {
  clearAuthSession,
} from "../utils/auth";

import {
  syncPendingAssessment,
} from "../utils/syncAssessment";

import {
  loadUserRoadmapProgress,
} from "../utils/roadmapProgress";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const REQUEST_TIMEOUT_MS =
  60000;

/* ======================================
   FETCH WITH TIMEOUT
====================================== */

async function fetchWithTimeout(
  url,
  options = {},
  timeout =
    REQUEST_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(
      () => {
        controller.abort();
      },
      timeout
    );

  try {
    return await fetch(
      url,
      {
        ...options,

        signal:
          controller.signal,
      }
    );
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

/* ======================================
   FRIENDLY REQUEST ERROR
====================================== */

function getFriendlyRequestError(
  error
) {
  if (
    error?.name ===
    "AbortError"
  ) {
    return (
      "SkillPath is taking longer than expected to respond. " +
      "Please try again in a moment."
    );
  }

  if (
    error instanceof TypeError ||
    error?.message ===
      "Failed to fetch"
  ) {
    return (
      "Unable to connect to the SkillPath server. " +
      "Check your internet connection and try again."
    );
  }

  return (
    error?.message ||
    "Unable to login."
  );
}

/* ======================================
   CLEAR USER-SPECIFIC LOCAL DATA
====================================== */

function clearCareerData() {
  localStorage.removeItem(
    "skillPathAssessment"
  );

  localStorage.removeItem(
    "skillPathAssessmentId"
  );

  localStorage.removeItem(
    "skillPathRoadmapProgress"
  );

  localStorage.removeItem(
    "skillPathSyncPending"
  );

  localStorage.removeItem(
    "skillPathRoadmapSyncPending"
  );
}

/* ======================================
   LOAD LOGGED-IN USER ASSESSMENT
====================================== */

async function loadUserAssessment(
  token,
  userId
) {
  const previousAssessmentId =
    localStorage.getItem(
      "skillPathAssessmentId"
    );

  const response =
    await fetchWithTimeout(
      `${API_BASE_URL}/api/assessments/latest`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  let data

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  // ======================================
  // USER HAS NO ASSESSMENT
  // ======================================

  if (
    response.status === 404
  ) {
    clearCareerData();

    localStorage.setItem(
      "skillPathLocalUserId",
      String(userId)
    );

    return null;
  }

  // ======================================
  // INVALID / EXPIRED TOKEN
  // ======================================

  if (
    response.status === 401
  ) {
    clearAuthSession();

    throw new Error(
      "Your login session is invalid. Please log in again."
    );
  }

  // ======================================
  // OTHER SERVER ERROR
  // ======================================

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to load your assessment."
    );
  }

  const assessment =
    data?.assessment;

  if (!assessment) {
    throw new Error(
      "Assessment data is missing."
    );
  }

  // ======================================
  // PREVENT OLD ROADMAP MIXING
  // ======================================

  const serverAssessmentId =
    String(
      assessment._id || ""
    );

  if (
    previousAssessmentId &&
    serverAssessmentId &&
    previousAssessmentId !==
      serverAssessmentId
  ) {
    localStorage.removeItem(
      "skillPathRoadmapProgress"
    );

    localStorage.removeItem(
      "skillPathRoadmapSyncPending"
    );
  }

  // ======================================
  // CONVERT DATABASE ASSESSMENT
  // TO FRONTEND FORMAT
  // ======================================

  const localAssessment = {
    education:
      assessment.education,

    technicalSkills:
      Array.isArray(
        assessment.technicalSkills
      )
        ? assessment.technicalSkills
        : [],

    experience:
      assessment.experience,

    problemSolving:
      assessment.problemSolving,

    careerInterest:
      assessment.careerInterest,

    goal:
      assessment.goal,

    completedAt:
      assessment.createdAt ||
      assessment.updatedAt ||
      new Date().toISOString(),
  };

  // ======================================
  // SAVE THIS USER'S ASSESSMENT
  // ======================================

  localStorage.setItem(
    "skillPathAssessment",
    JSON.stringify(
      localAssessment
    )
  );

  if (serverAssessmentId) {
    localStorage.setItem(
      "skillPathAssessmentId",
      serverAssessmentId
    );
  }

  localStorage.setItem(
    "skillPathLocalUserId",
    String(userId)
  );

  localStorage.removeItem(
    "skillPathSyncPending"
  );

  console.log(
    "User assessment loaded successfully."
  );

  return assessment;
}

/* ======================================
   LOGIN PAGE
====================================== */

function Login() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  // ======================================
  // VALIDATION
  // ======================================

  const cleanEmail =
    email
      .trim()
      .toLowerCase();

  const canSubmit =
    cleanEmail.length > 0 &&
    password.length > 0 &&
    !isSubmitting;

  // ======================================
  // LOGIN
  // ======================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        isSubmitting ||
        !canSubmit
      ) {
        return;
      }

      setError("");
      setLoadingMessage("");

      // ======================================
      // EMAIL
      // ======================================

      if (!cleanEmail) {
        setError(
          "Please enter your email address."
        );

        return;
      }

      // ======================================
      // PASSWORD
      // ======================================

      if (!password) {
        setError(
          "Please enter your password."
        );

        return;
      }

      // ======================================
      // EMAIL FORMAT
      // ======================================

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      setIsSubmitting(true);

      setLoadingMessage(
        "Connecting securely to SkillPath..."
      );

      // ======================================
      // RENDER COLD START MESSAGE
      // ======================================

      const slowServerTimer =
        window.setTimeout(
          () => {
            setLoadingMessage(
              "SkillPath is starting the server. The first request may take a few extra seconds."
            );
          },
          4000
        );

      try {
        // ======================================
        // LOGIN REQUEST
        // ======================================

        const response =
          await fetchWithTimeout(
            `${API_BASE_URL}/api/auth/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email:
                    cleanEmail,

                  password,
                }),
            }
          );

        window.clearTimeout(
          slowServerTimer
        );

        let data = null;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to login."
          );
        }

        if (
          !data?.token ||
          !data?.user?.id
        ) {
          throw new Error(
            "Invalid login response."
          );
        }

        const currentUserId =
          String(
            data.user.id
          );

        setLoadingMessage(
          "Login successful. Restoring your SkillPath data..."
        );

        // ======================================
        // CHECK PREVIOUS LOCAL USER
        // ======================================

        const previousLocalUserId =
          localStorage.getItem(
            "skillPathLocalUserId"
          );

        if (
          previousLocalUserId &&
          previousLocalUserId !==
            currentUserId
        ) {
          clearCareerData();
        }

        // ======================================
        // SAVE AUTH SESSION
        // ======================================

        localStorage.setItem(
          "skillPathAuthToken",
          data.token
        );

        localStorage.setItem(
          "skillPathUser",
          JSON.stringify(
            data.user
          )
        );

        console.log(
          "Login successful."
        );

        // ======================================
        // SYNC PENDING ASSESSMENT
        // ======================================

        const hasPendingAssessment =
          localStorage.getItem(
            "skillPathSyncPending"
          ) === "true";

        if (
          hasPendingAssessment
        ) {
          setLoadingMessage(
            "Syncing your latest assessment..."
          );

          const syncResult =
            await syncPendingAssessment();

          if (
            syncResult?.reason ===
            "authentication-expired"
          ) {
            throw new Error(
              "Your login session could not be verified. Please log in again."
            );
          }
        }

        // ======================================
        // LOAD THIS USER'S ASSESSMENT
        // ======================================

        setLoadingMessage(
          "Loading your career assessment..."
        );

        await loadUserAssessment(
          data.token,
          currentUserId
        );

        // ======================================
        // LOAD THIS USER'S ROADMAP
        // ======================================

        setLoadingMessage(
          "Restoring your roadmap progress..."
        );

        const roadmapResult =
          await loadUserRoadmapProgress();

        if (
          roadmapResult?.reason ===
          "authentication-expired"
        ) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        console.log(
          "User roadmap progress restored."
        );

        // ======================================
        // REMEMBER LOCAL DATA OWNER
        // ======================================

        localStorage.setItem(
          "skillPathLocalUserId",
          currentUserId
        );

        // ======================================
        // DASHBOARD
        // ======================================

        setLoadingMessage(
          "Opening your dashboard..."
        );

        window.location.href =
          "/dashboard";
      } catch (requestError) {
        window.clearTimeout(
          slowServerTimer
        );

        console.error(
          "Login failed:",
          requestError
        );

        setError(
          getFriendlyRequestError(
            requestError
          )
        );

        setLoadingMessage("");

        setIsSubmitting(false);
      }
    };

  return (
    <div className="auth-page">

      <div className="auth-background-glow" />

      <div className="auth-container">

        {/* ======================================
            BACK
        ====================================== */}

        <button
          type="button"
          className="auth-back-button"
          disabled={
            isSubmitting
          }
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

        {/* ======================================
            BRAND
        ====================================== */}

        <div className="auth-brand">

          <div className="logo-icon">

            <Compass
              size={21}
            />

          </div>

          <span>
            SkillPath
          </span>

        </div>

        {/* ======================================
            LOGIN CARD
        ====================================== */}

        <div className="auth-card">

          <div className="auth-heading">

            <span className="auth-label">
              WELCOME BACK
            </span>

            <h1>
              Continue your
              <span>
                {" "}
                career journey.
              </span>
            </h1>

            <p>
              Log in to access your
              SkillPath dashboard,
              assessments, career
              recommendations, and
              roadmap.
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={
              handleSubmit
            }
            noValidate
          >

            {/* ======================================
                EMAIL
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="loginEmail"
              >
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail
                  size={18}
                />

                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  required
                  disabled={
                    isSubmitting
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(
                    event
                  ) => {
                    setEmail(
                      event.target
                        .value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                />

              </div>

            </div>

            {/* ======================================
                PASSWORD
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="loginPassword"
              >
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole
                  size={18}
                />

                <input
                  id="loginPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    password
                  }
                  required
                  disabled={
                    isSubmitting
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  onChange={(
                    event
                  ) => {
                    setPassword(
                      event.target
                        .value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  disabled={
                    isSubmitting
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() => {
                    setShowPassword(
                      (current) =>
                        !current
                    );
                  }}
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>

            </div>

            {/* ======================================
                LOADING STATUS
            ====================================== */}

            {isSubmitting &&
              loadingMessage && (
                <div className="auth-loading-message">

                  <LoaderCircle
                    size={18}
                    className="auth-loading-spinner"
                  />

                  <span>
                    {loadingMessage}
                  </span>

                </div>
              )}

            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
              <div className="auth-message auth-error">
                {error}
              </div>
            )}

            {/* ======================================
                LOGIN BUTTON
            ====================================== */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={
                !canSubmit
              }
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="auth-loading-spinner"
                  />

                  Please wait...
                </>
              ) : (
                <>
                  Log In

                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </button>

          </form>

          {/* ======================================
              REGISTER
          ====================================== */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() => {
                window.location.href =
                  "/register";
              }}
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;