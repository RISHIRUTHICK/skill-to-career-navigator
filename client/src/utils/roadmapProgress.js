import {
  clearAuthSession,
  getAuthToken,
} from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ======================================
   CLEAN ROADMAP ITEMS
====================================== */

function normalizeCompletedItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [
    ...new Set(
      items
        .filter(
          (item) =>
            typeof item === "string"
        )
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

/* ======================================
   GET LOCAL ROADMAP PROGRESS
====================================== */

function getLocalRoadmapProgress() {
  try {
    const savedProgress =
      localStorage.getItem(
        "skillPathRoadmapProgress"
      );

    if (!savedProgress) {
      return [];
    }

    return normalizeCompletedItems(
      JSON.parse(savedProgress)
    );
  } catch (error) {
    console.error(
      "Unable to read local roadmap progress:",
      error
    );

    return [];
  }
}

/* ======================================
   SAVE ROADMAP TO SERVER
====================================== */

async function uploadRoadmapProgress(
  token,
  completedItems
) {
  const response = await fetch(
    `${API_BASE_URL}/api/roadmap-progress`,
    {
      method: "PUT",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        completedItems:
          normalizeCompletedItems(
            completedItems
          ),
      }),
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

  if (response.status === 401) {
    clearAuthSession();

    return {
      success: false,
      authenticationExpired: true,
      completedItems: [],
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Unable to save roadmap progress."
    );
  }

  const savedProgress =
    normalizeCompletedItems(
      data?.completedItems
    );

  localStorage.setItem(
    "skillPathRoadmapProgress",
    JSON.stringify(savedProgress)
  );

  localStorage.removeItem(
    "skillPathRoadmapSyncPending"
  );

  return {
    success: true,
    completedItems:
      savedProgress,
  };
}

/* ======================================
   LOAD CURRENT USER ROADMAP
====================================== */

export async function loadUserRoadmapProgress() {
  const token =
    getAuthToken();

  if (!token) {
    return {
      success: false,
      reason: "not-authenticated",
      completedItems: [],
    };
  }

  const localProgress =
    getLocalRoadmapProgress();

  const hasPendingProgress =
    localStorage.getItem(
      "skillPathRoadmapSyncPending"
    ) === "true";

  /*
    Local progress is newer than MongoDB.
    Upload it before downloading anything.
  */

  if (hasPendingProgress) {
    try {
      const result =
        await uploadRoadmapProgress(
          token,
          localProgress
        );

      if (
        result.authenticationExpired
      ) {
        return {
          success: false,
          reason:
            "authentication-expired",
          completedItems: [],
        };
      }

      return {
        success: true,
        completedItems:
          result.completedItems,
      };
    } catch (error) {
      console.warn(
        "Pending roadmap progress could not be synchronized:",
        error.message
      );

      return {
        success: true,
        offline: true,
        completedItems:
          localProgress,
      };
    }
  }

  /* ======================================
     GET FROM MONGODB
  ====================================== */

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/roadmap-progress`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
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

    if (response.status === 401) {
      clearAuthSession();

      return {
        success: false,
        reason:
          "authentication-expired",
        completedItems: [],
      };
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load roadmap progress."
      );
    }

    const serverProgress =
      normalizeCompletedItems(
        data?.completedItems
      );

    /*
      Existing SkillPath users may already
      have local progress from before
      MongoDB roadmap storage existed.

      If MongoDB has never saved progress
      but local progress exists, migrate it.
    */

    const noServerProgressYet =
      data?.message ===
      "No roadmap progress found yet.";

    if (
      noServerProgressYet &&
      localProgress.length > 0
    ) {
      try {
        const migrated =
          await uploadRoadmapProgress(
            token,
            localProgress
          );

        if (
          migrated.authenticationExpired
        ) {
          return {
            success: false,
            reason:
              "authentication-expired",
            completedItems: [],
          };
        }

        console.log(
          "Existing roadmap progress migrated to MongoDB."
        );

        return {
          success: true,
          completedItems:
            migrated.completedItems,
        };
      } catch (error) {
        console.warn(
          "Unable to migrate local roadmap progress:",
          error.message
        );

        localStorage.setItem(
          "skillPathRoadmapSyncPending",
          "true"
        );

        return {
          success: true,
          offline: true,
          completedItems:
            localProgress,
        };
      }
    }

    /*
      MongoDB is now the source of truth.
    */

    localStorage.setItem(
      "skillPathRoadmapProgress",
      JSON.stringify(
        serverProgress
      )
    );

    localStorage.removeItem(
      "skillPathRoadmapSyncPending"
    );

    console.log(
      "User roadmap progress loaded successfully."
    );

    return {
      success: true,
      completedItems:
        serverProgress,
    };
  } catch (error) {
    console.warn(
      "Unable to load roadmap progress from MongoDB. Using local progress:",
      error.message
    );

    return {
      success: true,
      offline: true,
      completedItems:
        localProgress,
    };
  }
}