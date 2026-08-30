import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { useState } from "react";
import "../App.css";

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
  timeout = REQUEST_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(() => {
      controller.abort();
    }, timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
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
    "Unable to create account."
  );
}

/* ======================================
   REGISTER PAGE
====================================== */

function Register() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* ======================================
     CLEAN VALUES
  ====================================== */

  const cleanName =
    name.trim();

  const cleanEmail =
    email
      .trim()
      .toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ======================================
     FORM VALIDATION
  ====================================== */

  const isNameValid =
    cleanName.length >= 2;

  const isEmailValid =
    emailPattern.test(
      cleanEmail
    );

  const isPasswordValid =
    password.length >= 8;

  const passwordsMatch =
    password ===
      confirmPassword &&
    confirmPassword.length >= 8;

  const canSubmit =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch &&
    !isSubmitting;

  /* ======================================
     CLEAR MESSAGE WHEN EDITING
  ====================================== */

  const clearMessages = () => {
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* ======================================
     REGISTER
  ====================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !canSubmit ||
        isSubmitting
      ) {
        return;
      }

      setError("");
      setSuccess("");
      setLoadingMessage("");

      // ======================================
      // NAME CHECK
      // ======================================

      if (!isNameValid) {
        setError(
          "Name must contain at least 2 characters."
        );

        return;
      }

      // ======================================
      // EMAIL CHECK
      // ======================================

      if (!isEmailValid) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      // ======================================
      // PASSWORD CHECK
      // ======================================

      if (!isPasswordValid) {
        setError(
          "Password must contain at least 8 characters."
        );

        return;
      }

      // ======================================
      // CONFIRM PASSWORD
      // ======================================

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
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
        window.setTimeout(() => {
          setLoadingMessage(
            "SkillPath is starting the server. The first request may take a few extra seconds."
          );
        }, 4000);

      try {
        // ======================================
        // REGISTER REQUEST
        // ======================================

        const response =
          await fetchWithTimeout(
            `${API_BASE_URL}/api/auth/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    cleanName,

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
              "Unable to create account."
          );
        }

        // ======================================
        // SUCCESS
        // ======================================

        setLoadingMessage(
          "Preparing your SkillPath account..."
        );

        setSuccess(
          "Account created successfully."
        );

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        // ======================================
        // REDIRECT
        // ======================================

        window.setTimeout(() => {
          setLoadingMessage(
            "Redirecting you to login..."
          );
        }, 400);

        window.setTimeout(() => {
          window.location.href =
            "/login";
        }, 1200);
      } catch (requestError) {
        window.clearTimeout(
          slowServerTimer
        );

        console.error(
          "Registration failed:",
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
            CARD
        ====================================== */}

        <div className="auth-card">

          <div className="auth-heading">

            <span className="auth-label">
              CREATE YOUR ACCOUNT
            </span>

            <h1>
              Start building your
              <span>
                {" "}
                career path.
              </span>
            </h1>

            <p>
              Create your SkillPath
              account to save your
              assessments, roadmap
              progress, and career
              recommendations.
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
                NAME
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="name"
              >
                Full Name
              </label>

              <div className="auth-input-wrapper">

                <User
                  size={18}
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  required
                  disabled={
                    isSubmitting
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  onChange={(
                    event
                  ) => {
                    setName(
                      event.target
                        .value
                    );

                    clearMessages();
                  }}
                />

              </div>

            </div>

            {/* ======================================
                EMAIL
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="email"
              >
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail
                  size={18}
                />

                <input
                  id="email"
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

                    clearMessages();
                  }}
                />

              </div>

            </div>

            {/* ======================================
                PASSWORD
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="password"
              >
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole
                  size={18}
                />

                <input
                  id="password"
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
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  onChange={(
                    event
                  ) => {
                    setPassword(
                      event.target
                        .value
                    );

                    clearMessages();
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
                CONFIRM PASSWORD
            ====================================== */}

            <div className="auth-field">

              <label
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole
                  size={18}
                />

                <input
                  id="confirmPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  required
                  disabled={
                    isSubmitting
                  }
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  onChange={(
                    event
                  ) => {
                    setConfirmPassword(
                      event.target
                        .value
                    );

                    clearMessages();
                  }}
                />

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
                SUCCESS
            ====================================== */}

            {success && (
              <div className="auth-message auth-success">
                {success}
              </div>
            )}

            {/* ======================================
                SUBMIT
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
                  Create Account

                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </button>

          </form>

          {/* ======================================
              LOGIN LINK
          ====================================== */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() => {
                window.location.href =
                  "/login";
              }}
            >
              Log in
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;