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

  useEffect(() => {
    let active = true;

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
        // VERIFY TOKEN WITH BACKEND
        // ======================================

        try {
          const result =
            await verifyAuthSession();

          if (!active) {
            return;
          }

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
    };
  }, []);

  // ======================================
  // CHECKING
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

              <span className="auth-label">
                SKILLPATH
              </span>

              <h1>
                Verifying your
                <span>
                  {" "}
                  session...
                </span>
              </h1>

              <p>
                Please wait while
                SkillPath checks your
                account.
              </p>

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