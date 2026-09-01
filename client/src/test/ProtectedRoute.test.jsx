import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock(
  "../utils/auth",
  () => ({
    clearAuthSession: vi.fn(),
    getAuthToken: vi.fn(),
    verifyAuthSession: vi.fn(),
  })
);

import {
  clearAuthSession,
  getAuthToken,
  verifyAuthSession,
} from "../utils/auth";

import ProtectedRoute from "../components/ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ======================================
  // TEST 1: VALID SESSION
  // ======================================

  it(
    "allows access when the session is valid",
    async () => {
      getAuthToken.mockReturnValue(
        "test-token"
      );

      verifyAuthSession.mockResolvedValue({
        success: true,
        user: {
          id: "user-123",
          name: "Test User",
        },
      });

      render(
        <ProtectedRoute>
          <div>
            Protected Dashboard
          </div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            "Protected Dashboard"
          )
        ).toBeInTheDocument();
      });

      expect(
        verifyAuthSession
      ).toHaveBeenCalledTimes(1);

      expect(
        clearAuthSession
      ).not.toHaveBeenCalled();
    }
  );

  // ======================================
  // TEST 2: INVALID SESSION
  // ======================================

  it(
    "blocks access when session verification fails",
    async () => {
      getAuthToken.mockReturnValue(
        "invalid-token"
      );

      verifyAuthSession.mockResolvedValue({
        success: false,
        user: null,
      });

      render(
        <ProtectedRoute>
          <div>
            Protected Dashboard
          </div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(
          clearAuthSession
        ).toHaveBeenCalled();
      });

      expect(
        screen.queryByText(
          "Protected Dashboard"
        )
      ).not.toBeInTheDocument();
    }
  );

  // ======================================
  // TEST 3: NO TOKEN
  // ======================================

  it(
    "does not verify with the backend when no token exists",
    async () => {
      getAuthToken.mockReturnValue(
        null
      );

      render(
        <ProtectedRoute>
          <div>
            Protected Dashboard
          </div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(
          verifyAuthSession
        ).not.toHaveBeenCalled();
      });

      expect(
        screen.queryByText(
          "Protected Dashboard"
        )
      ).not.toBeInTheDocument();
    }
  );
});