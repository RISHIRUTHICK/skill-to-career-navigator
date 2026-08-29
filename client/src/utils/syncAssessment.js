import {
  analyzeCareer,
} from "./careerAnalysis";

import {
  clearAuthSession,
  getAuthToken,
} from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

let activeSync = null;

/* ======================================
   PERFORM PENDING ASSESSMENT SYNC
====================================== */

async function performSync() {
  const isPending =
    localStorage.getItem(
      "skillPathSyncPending"
    ) === "true";

  /*
    Nothing needs to be uploaded.
  */

  if (!isPending) {
    return {
      success: true,
      synced: false,
      reason: "nothing-pending",
    };
  }

  // ======================================
  // CHECK AUTHENTICATION
  // ======================================

  const token =
    getAuthToken();

  /*
    A pending assessment exists,
    but there is currently no logged-in
    user.

    Keep the pending marker so it can
    sync after the user logs in.
  */

  if (!token) {
    return {
      success: false,
      synced: false,
      reason: "not-authenticated",
    };
  }

  // ======================================
  // GET LOCAL ASSESSMENT
  // ======================================

  const savedAssessment =
    localStorage.getItem(
      "skillPathAssessment"
    );

  /*
    Pending marker exists but assessment
    data no longer exists.
  */

  if (!savedAssessment) {
    localStorage.removeItem(
      "skillPathSyncPending"
    );

    return {
      success: false,
      synced: false,
      reason: "assessment-missing",
    };
  }

  let assessmentData;

  // ======================================
  // PARSE LOCAL ASSESSMENT
  // ======================================

  try {
    assessmentData =
      JSON.parse(
        savedAssessment
      );
  } catch (error) {
    console.error(
      "Invalid local assessment data:",
      error
    );

    localStorage.removeItem(
      "skillPathSyncPending"
    );

    return {
      success: false,
      synced: false,
      reason: "invalid-local-data",
    };
  }

  // ======================================
  // REBUILD CAREER ANALYSIS
  // ======================================

  const analysis =
    analyzeCareer(
      assessmentData
    );

  if (!analysis) {
    console.error(
      "Unable to analyze pending assessment."
    );

    return {
      success: false,
      synced: false,
      reason: "analysis-failed",
    };
  }

  // ======================================
  // CREATE BACKEND PAYLOAD
  // ======================================

  const payload = {
    education:
      assessmentData.education,

    technicalSkills:
      Array.isArray(
        assessmentData.technicalSkills
      )
        ? assessmentData.technicalSkills
        : [],

    experience:
      assessmentData.experience,

    problemSolving:
      assessmentData.problemSolving,

    careerInterest:
      assessmentData.careerInterest,

    goal:
      assessmentData.goal,

    recommendedCareer:
      analysis.recommendedCareer ||
      "",

    readinessScore:
      typeof analysis.readinessScore ===
      "number"
        ? analysis.readinessScore
        : 0,
  };

  // ======================================
  // SEND PENDING ASSESSMENT
  // ======================================

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/assessments`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch {
      throw new Error(
        "The backend returned an invalid response."
      );
    }

    // ======================================
    // EXPIRED / INVALID JWT
    // ======================================

    if (
      response.status === 401
    ) {
      /*
        Remove only the invalid login
        session.

        Keep assessment +
        skillPathSyncPending so it can
        sync after the user logs in again.
      */

      clearAuthSession();

      console.warn(
        "Assessment sync paused because the login session is invalid or expired."
      );

      return {
        success: false,
        synced: false,
        reason: "authentication-expired",
      };
    }

    // ======================================
    // OTHER SERVER ERROR
    // ======================================

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Pending assessment sync failed."
      );
    }

    // ======================================
    // STORE MONGODB DOCUMENT ID
    // ======================================

    if (
      data?.assessment?._id
    ) {
      localStorage.setItem(
        "skillPathAssessmentId",
        data.assessment._id
      );
    }

    // ======================================
    // SYNC SUCCESSFUL
    // ======================================

    localStorage.removeItem(
      "skillPathSyncPending"
    );

    console.log(
      "Pending user assessment synced successfully."
    );

    return {
      success: true,
      synced: true,

      assessmentId:
        data?.assessment?._id ||
        null,
    };
  } catch (error) {
    /*
      Keep the pending marker.

      App.jsx will retry:
      - when internet returns
      - every 30 seconds
      - next time SkillPath loads
    */

    console.warn(
      "Assessment sync is still pending:",
      error.message
    );

    return {
      success: false,
      synced: false,
      reason: "backend-unavailable",
    };
  }
}

/* ======================================
   PUBLIC SYNC FUNCTION
====================================== */

export function syncPendingAssessment() {
  /*
    Prevent multiple simultaneous
    sync requests.
  */

  if (activeSync) {
    return activeSync;
  }

  activeSync =
    performSync().finally(
      () => {
        activeSync = null;
      }
    );

  return activeSync;
}