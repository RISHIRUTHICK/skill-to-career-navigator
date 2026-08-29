import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import { useState } from "react";
import "../App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================
  // CLEAN VALUES
  // ======================================

  const cleanName =
    name.trim();

  const cleanEmail =
    email.trim().toLowerCase();

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ======================================
  // FORM VALIDATION
  // ======================================

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

  // ======================================
  // CLEAR MESSAGE WHEN EDITING
  // ======================================

  const clearMessages = () => {
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ======================================
  // REGISTER
  // ======================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !canSubmit ||
      isSubmitting
    ) {
      return;
    }

    setError("");
    setSuccess("");

    // ------------------------------
    // NAME CHECK
    // ------------------------------

    if (!isNameValid) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }

    // ------------------------------
    // EMAIL CHECK
    // ------------------------------

    if (!isEmailValid) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    // ------------------------------
    // PASSWORD CHECK
    // ------------------------------

    if (!isPasswordValid) {
      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }

    // ------------------------------
    // CONFIRM PASSWORD
    // ------------------------------

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

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: cleanName,
              email: cleanEmail,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create account."
        );
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        window.location.href =
          "/login";
      }, 1200);
    } catch (requestError) {
      console.error(
        "Registration failed:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to create account."
      );
    } finally {
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
          disabled={isSubmitting}
          onClick={() => {
            window.location.href =
              "/";
          }}
        >
          <ArrowLeft size={17} />
          Home
        </button>

        {/* ======================================
            BRAND
        ====================================== */}

        <div className="auth-brand">

          <div className="logo-icon">
            <Compass size={21} />
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
            onSubmit={handleSubmit}
            noValidate
          >

            {/* ======================================
                NAME
            ====================================== */}

            <div className="auth-field">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="auth-input-wrapper">

                <User size={18} />

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
                  onChange={(event) => {
                    setName(
                      event.target.value
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

              <label htmlFor="email">
                Email Address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

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
                  onChange={(event) => {
                    setEmail(
                      event.target.value
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

              <label htmlFor="password">
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
                  value={password}
                  required
                  disabled={
                    isSubmitting
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setPassword(
                      event.target.value
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
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* ======================================
                CONFIRM PASSWORD
            ====================================== */}

            <div className="auth-field">

              <label htmlFor="confirmPassword">
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
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );

                    clearMessages();
                  }}
                />

              </div>

            </div>

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
              disabled={!canSubmit}
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}

              {!isSubmitting && (
                <ArrowRight
                  size={18}
                />
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
              disabled={isSubmitting}
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