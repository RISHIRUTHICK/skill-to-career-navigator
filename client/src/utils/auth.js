const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const SESSION_TIMEOUT_MS =
  60000;

// ======================================
// GET TOKEN
// ======================================

export function getAuthToken() {
  return localStorage.getItem(
    "skillPathAuthToken"
  );
}

// ======================================
// GET SAVED USER
// ======================================

export function getSavedUser() {
  try {
    const savedUser =
      localStorage.getItem(
        "skillPathUser"
      );

    if (!savedUser) {
      return null;
    }

    const parsedUser =
      JSON.parse(savedUser);

    if (
      !parsedUser ||
      !parsedUser.id
    ) {
      return null;
    }

    return parsedUser;
  } catch (error) {
    console.error(
      "Unable to read saved user:",
      error
    );

    return null;
  }
}

// ======================================
// CHECK LOCAL SESSION
// ======================================

export function hasAuthSession() {
  const token =
    getAuthToken();

  const user =
    getSavedUser();

  return Boolean(
    token &&
    user &&
    user.id
  );
}

// ======================================
// FETCH WITH TIMEOUT
// ======================================

async function fetchWithTimeout(
  url,
  options = {},
  timeout = SESSION_TIMEOUT_MS
) {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(() => {
      controller.abort();
    }, timeout);

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

// ======================================
// LOCAL OFFLINE FALLBACK
// ======================================

function getOfflineSession(
  reason = "network-unavailable"
) {
  const localUser =
    getSavedUser();

  const localSessionExists =
    hasAuthSession();

  /*
    A temporary network/backend problem
    should not immediately remove a
    previously valid local session.
  */

  if (
    localSessionExists &&
    localUser
  ) {
    return {
      success: true,
      user: localUser,
      offline: true,
      reason,
    };
  }

  return {
    success: false,
    user: null,
    offline: true,
    reason,
  };
}

// ======================================
// VERIFY TOKEN WITH BACKEND
// ======================================

export async function verifyAuthSession() {
  const token =
    getAuthToken();

  // ======================================
  // NO LOCAL TOKEN
  // ======================================

  if (!token) {
    return {
      success: false,
      user: null,
      offline: false,
      reason: "missing-token",
    };
  }

  // ======================================
  // BROWSER REPORTS OFFLINE
  // ======================================

  if (
    typeof navigator !==
      "undefined" &&
    navigator.onLine === false
  ) {
    console.warn(
      "SkillPath is offline. Using the saved session."
    );

    return getOfflineSession(
      "offline"
    );
  }

  try {
    // ======================================
    // VERIFY SESSION
    // ======================================

    const response =
      await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/me`,
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
    } catch (error) {
      console.warn(
        "Unable to read authentication response:",
        error
      );

      /*
        Do not destroy the local session
        because of a temporary malformed
        server/proxy response.
      */

      return getOfflineSession(
        "invalid-response"
      );
    }

    // ======================================
    // TOKEN INVALID OR EXPIRED
    // ======================================

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      clearAuthSession();

      return {
        success: false,
        user: null,
        offline: false,
        reason:
          response.status === 401
            ? "authentication-expired"
            : "authentication-forbidden",
        message:
          data?.message ||
          "Your session is no longer valid.",
      };
    }

    // ======================================
    // TEMPORARY SERVER ERROR
    // ======================================

    if (!response.ok) {
      console.warn(
        "Authentication server returned:",
        response.status
      );

      return getOfflineSession(
        "server-unavailable"
      );
    }

    // ======================================
    // USER MISSING FROM RESPONSE
    // ======================================

    if (
      !data?.user ||
      !data.user.id
    ) {
      console.warn(
        "Authentication response did not include a valid user."
      );

      return getOfflineSession(
        "invalid-response"
      );
    }

    // ======================================
    // REFRESH LOCAL USER
    // ======================================

    localStorage.setItem(
      "skillPathUser",
      JSON.stringify(
        data.user
      )
    );

    return {
      success: true,
      user: data.user,
      offline: false,
      reason: "verified",
    };
  } catch (error) {
    // ======================================
    // REQUEST TIMEOUT
    // ======================================

    if (
      error?.name ===
      "AbortError"
    ) {
      console.warn(
        "Authentication verification timed out."
      );

      return getOfflineSession(
        "request-timeout"
      );
    }

    // ======================================
    // NETWORK / BACKEND UNAVAILABLE
    // ======================================

    console.warn(
      "Unable to verify login session:",
      error?.message ||
        error
    );

    return getOfflineSession(
      "network-unavailable"
    );
  }
}

// ======================================
// CLEAR AUTH SESSION
// ======================================

export function clearAuthSession() {
  localStorage.removeItem(
    "skillPathAuthToken"
  );

  localStorage.removeItem(
    "skillPathUser"
  );
}

// ======================================
// LOGOUT
// ======================================

export function logoutUser() {
  clearAuthSession();

  window.location.href =
    "/login";
}