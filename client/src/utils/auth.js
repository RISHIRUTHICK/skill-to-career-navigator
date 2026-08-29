const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

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

    return JSON.parse(savedUser);
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
// VERIFY TOKEN WITH BACKEND
// ======================================

export async function verifyAuthSession() {
  const token =
    getAuthToken();

  if (!token) {
    return {
      success: false,
      user: null,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/me`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      clearAuthSession();

      return {
        success: false,
        user: null,
      };
    }

    if (!data?.user) {
      clearAuthSession();

      return {
        success: false,
        user: null,
      };
    }

    localStorage.setItem(
      "skillPathUser",
      JSON.stringify(
        data.user
      )
    );

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.warn(
      "Unable to verify login session:",
      error.message
    );

    /*
      Do not immediately log the user out
      when the backend is temporarily offline.
    */
    return {
      success:
        hasAuthSession(),
      user:
        getSavedUser(),
      offline: true,
    };
  }
}

// ======================================
// LOGOUT
// ======================================

export function clearAuthSession() {
  localStorage.removeItem(
    "skillPathAuthToken"
  );

  localStorage.removeItem(
    "skillPathUser"
  );
}

export function logoutUser() {
  clearAuthSession();

  window.location.href =
    "/login";
}