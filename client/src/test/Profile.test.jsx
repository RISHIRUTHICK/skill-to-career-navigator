import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// ======================================
// MOCK AUTH
// ======================================

vi.mock(
  "../utils/auth",
  () => ({
    clearAuthSession: vi.fn(),
    getAuthToken: vi.fn(),
    getSavedUser: vi.fn(),
    logoutUser: vi.fn(),
  })
);

// ======================================
// MOCK CAREER ANALYSIS
// ======================================

vi.mock(
  "../utils/careerAnalysis",
  () => ({
    analyzeCareer: vi.fn(),
  })
);

import {
  getAuthToken,
  getSavedUser,
} from "../utils/auth";

import {
  analyzeCareer,
} from "../utils/careerAnalysis";

import Profile from "../Pages/Profile";

const testUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
};

const testAssessment = {
  education: "Computer Science",

  technicalSkills: [
    "Python",
    "Machine Learning",
  ],

  experience:
    "Internship experience",

  problemSolving:
    "Intermediate",

  careerInterest:
    "Data & AI",

  goal:
    "Get my first job",
};

const testAnalysis = {
  recommendedCareer:
    "Data / AI Engineer",

  readinessScore: 74,

  skills: [
    "Python",
    "Machine Learning",
  ],

  strengths: [
    "Programming foundation",
  ],

  skillGaps: [
    "SQL",
  ],
};

describe("Profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    getSavedUser.mockReturnValue(
      testUser
    );

    getAuthToken.mockReturnValue(
      "test-token"
    );

    analyzeCareer.mockReturnValue(
      testAnalysis
    );

    globalThis.fetch =
  vi.fn();

    Element.prototype.scrollIntoView =
      vi.fn();

    localStorage.setItem(
      "skillPathAssessment",
      JSON.stringify(
        testAssessment
      )
    );

    localStorage.setItem(
      "skillPathRoadmapProgress",
      JSON.stringify([
        "Data / AI Engineer-0-0",
        "Data / AI Engineer-0-1",
      ])
    );
  });

  // ======================================
  // TEST 1: PROFILE DATA
  // ======================================

  it(
    "renders user and career information",
    () => {
      render(<Profile />);

      expect(
        screen.getByText(
          "YOUR SKILLPATH PROFILE"
        )
      ).toBeInTheDocument();

      expect(
        screen.getAllByText(
          "Test User"
        ).length
      ).toBeGreaterThan(0);

      expect(
        screen.getByText(
          "test@example.com"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Data / AI Engineer"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name: "74%",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "13%"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "2 / 16"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Get my first job"
        )
      ).toBeInTheDocument();

      expect(
        analyzeCareer
      ).toHaveBeenCalledWith(
        testAssessment
      );
    }
  );

  // ======================================
  // TEST 2: EDIT PROFILE
  // ======================================

  it(
    "updates the user's profile name",
    async () => {
      const userEventInstance =
        userEvent.setup();

      const updatedUser = {
        ...testUser,
        name: "Updated User",
      };

      fetch.mockResolvedValue({
        ok: true,
        status: 200,

        json:
          vi.fn().mockResolvedValue({
            success: true,
            user: updatedUser,
          }),
      });

      render(<Profile />);

      await userEventInstance.click(
        screen.getByRole(
          "button",
          {
            name: /Edit Profile/i,
          }
        )
      );

      const nameInput =
        screen.getByLabelText(
          "Full Name"
        );

      await userEventInstance.clear(
        nameInput
      );

      await userEventInstance.type(
        nameInput,
        "Updated User"
      );

      await userEventInstance.click(
        screen.getByRole(
          "button",
          {
            name:
              /Save Changes/i,
          }
        )
      );

      await waitFor(() => {
        expect(
          fetch
        ).toHaveBeenCalledTimes(
          1
        );
      });

      expect(
        fetch
      ).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/auth/profile"
        ),
        expect.objectContaining({
          method: "PUT",

          headers:
            expect.objectContaining({
              Authorization:
                "Bearer test-token",
            }),
        })
      );

      expect(
        screen.getByText(
          "Profile updated successfully."
        )
      ).toBeInTheDocument();

      expect(
        JSON.parse(
          localStorage.getItem(
            "skillPathUser"
          )
        )
      ).toEqual(
        updatedUser
      );
    }
  );

  // ======================================
  // TEST 3: PASSWORD VALIDATION
  // ======================================

  it(
    "shows an error when new passwords do not match",
    async () => {
      const userEventInstance =
        userEvent.setup();

      render(<Profile />);

      const passwordButtons =
        screen.getAllByRole(
          "button",
          {
            name:
              "Change Password",
          }
        );

      await userEventInstance.click(
        passwordButtons[0]
      );

      await userEventInstance.type(
        screen.getByLabelText(
          "Current Password"
        ),
        "oldpassword"
      );

      await userEventInstance.type(
        screen.getByLabelText(
          "New Password"
        ),
        "newpassword123"
      );

      await userEventInstance.type(
        screen.getByLabelText(
          "Confirm New Password"
        ),
        "different123"
      );

      const savePasswordButton =
        screen.getByRole(
          "button",
          {
            name:
              "Save Password",
          }
        );

      expect(
        savePasswordButton
      ).toBeEnabled();

      await userEventInstance.click(
        savePasswordButton
      );

      expect(
        screen.getByText(
          "New password and confirm password do not match."
        )
      ).toBeInTheDocument();

      expect(
        fetch
      ).not.toHaveBeenCalled();
    }
  );

  // ======================================
  // TEST 4: DELETE ACCOUNT SAFEGUARD
  // ======================================

  it(
    "requires DELETE confirmation before enabling permanent deletion",
    async () => {
      const userEventInstance =
        userEvent.setup();

      render(<Profile />);

      await userEventInstance.click(
        screen.getByRole(
          "button",
          {
            name:
              "Delete Account",
          }
        )
      );

      const deleteButton =
        screen.getByRole(
          "button",
          {
            name:
              "Delete Permanently",
          }
        );

      expect(
        deleteButton
      ).toBeDisabled();

      await userEventInstance.type(
        screen.getByLabelText(
          "Current Password"
        ),
        "password123"
      );

      await userEventInstance.type(
        screen.getByLabelText(
          "Type DELETE to confirm"
        ),
        "WRONG"
      );

      expect(
        deleteButton
      ).toBeDisabled();

      const confirmationInput =
        screen.getByLabelText(
          "Type DELETE to confirm"
        );

      await userEventInstance.clear(
        confirmationInput
      );

      await userEventInstance.type(
        confirmationInput,
        "DELETE"
      );

      expect(
        deleteButton
      ).toBeEnabled();

      expect(
        fetch
      ).not.toHaveBeenCalled();
    }
  );
});