import {
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  clearAuthSession,
  getAuthToken,
  verifyAuthSession,
} from "../utils/auth";

function ProtectedRoute({
  children,
}) {
  const [
    status,
    setStatus,
  ] = useState("checking");

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Verifying your SkillPath session..."
  );

  useEffect(() => {
    let active = true;

    let slowServerTimer = null;
    let verySlowServerTimer = null;

    const protectPage =
      async () => {
        // ======================================
        // FIRST CHECK: TOKEN MUST EXIST
        // ======================================

        const token =
          getAuthToken();

        if (!token) {
          if (active) {
            setStatus(
              "unauthenticated"
            );
          }

          window.location.replace(
            "/login"
          );

          return;
        }

        // ======================================
        // INITIAL LOADING MESSAGE
        // ======================================

        if (active) {
          setLoadingMessage(
            "Verifying your SkillPath session..."
          );
        }

        // ======================================
        // SLOW SERVER MESSAGE
        // ======================================

        slowServerTimer =
          window.setTimeout(() => {
            if (active) {
              setLoadingMessage(
                "Connecting to the SkillPath server. This may take a few extra seconds."
              );
            }
          }, 4000);

        // ======================================
        // VERY SLOW SERVER MESSAGE
        // ======================================

        verySlowServerTimer =
          window.setTimeout(() => {
            if (active) {
              setLoadingMessage(
                "SkillPath is still preparing your account. Please keep this page open."
              );
            }
          }, 12000);

        // ======================================
        // VERIFY TOKEN WITH BACKEND
        // ======================================

        try {
          const result =
            await verifyAuthSession();

          if (!active) {
            return;
          }

          window.clearTimeout(
            slowServerTimer
          );

          window.clearTimeout(
            verySlowServerTimer
          );

          // ======================================
          // INVALID SESSION
          // ======================================

          if (
            !result?.success ||
            !result?.user
          ) {
            clearAuthSession();

            setStatus(
              "unauthenticated"
            );

            window.location.replace(
              "/login"
            );

            return;
          }

          // ======================================
          // SESSION VERIFIED
          // ======================================

          setLoadingMessage(
            "Session verified. Opening your account..."
          );

          setStatus(
            "authenticated"
          );
        } catch (error) {
          console.error(
            "Protected route verification failed:",
            error
          );

          if (!active) {
            return;
          }

          window.clearTimeout(
            slowServerTimer
          );

          window.clearTimeout(
            verySlowServerTimer
          );

          clearAuthSession();

          setStatus(
            "unauthenticated"
          );

          window.location.replace(
            "/login"
          );
        }
      };

    protectPage();

    return () => {
      active = false;

      if (slowServerTimer) {
        window.clearTimeout(
          slowServerTimer
        );
      }

      if (verySlowServerTimer) {
        window.clearTimeout(
          verySlowServerTimer
        );
      }
    };
  }, []);

  // ======================================
  // CHECKING SESSION
  // ======================================

  if (
    status === "checking"
  ) {
    return (
      <div className="auth-page">

        <div className="auth-background-glow" />

        <div className="auth-container">

          <div className="auth-card">

            <div className="auth-heading">

              <div
                className="auth-brand"
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <div className="logo-icon">
                  <ShieldCheck
                    size={21}
                  />
                </div>

                <span>
                  SkillPath
                </span>
              </div>

              <span className="auth-label">
                SECURE SESSION
              </span>

              <h1>
                Preparing your
                <span>
                  {" "}
                  account...
                </span>
              </h1>

              <div
                className="auth-loading-message"
                aria-live="polite"
              >
                <LoaderCircle
                  size={18}
                  className="auth-loading-spinner"
                />

                <span>
                  {loadingMessage}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ======================================
  // BLOCK PAGE
  // ======================================

  if (
    status !==
    "authenticated"
  ) {
    return null;
  }

  // ======================================
  // ALLOW PAGE
  // ======================================

  return children;
}

export default ProtectedRoute;