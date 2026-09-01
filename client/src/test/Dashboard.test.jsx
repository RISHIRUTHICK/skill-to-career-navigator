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
    getSavedUser: vi.fn(),
    logoutUser: vi.fn(),
    verifyAuthSession: vi.fn(),
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
  getSavedUser,
  logoutUser,
  verifyAuthSession,
} from "../utils/auth";

import {
  analyzeCareer,
} from "../utils/careerAnalysis";

import Dashboard from "../Pages/Dashboard";

// ======================================
// TEST DATA
// ======================================

const testUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
};

const testAssessment = {
  education:
    "Computer Science",

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

  readinessScore: 78,

  skills: [
    "Python",
    "Machine Learning",
  ],

  strengths: [
    "Python foundation",
  ],

  skillGaps: [
    "SQL",
    "Cloud Computing",
  ],
};

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    getSavedUser.mockReturnValue(
      testUser
    );

    verifyAuthSession.mockResolvedValue({
      success: true,
      user: testUser,
    });

    analyzeCareer.mockReturnValue(
      testAnalysis
    );
  });

  // ======================================
  // TEST 1: NO ASSESSMENT
  // ======================================

  it(
    "shows the empty dashboard when no assessment exists",
    async () => {
      render(<Dashboard />);

      expect(
        await screen.findByRole(
          "heading",
          {
            name:
              "Your dashboard is waiting.",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /Complete your SkillPath assessment first/i
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              /Start Assessment/i,
          }
        )
      ).toBeInTheDocument();

      expect(
        analyzeCareer
      ).not.toHaveBeenCalled();

      expect(
        verifyAuthSession
      ).toHaveBeenCalledTimes(1);
    }
  );

  // ======================================
  // TEST 2: DASHBOARD DATA
  // ======================================

  it(
    "displays career analysis and roadmap progress",
    async () => {
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

      render(<Dashboard />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "YOUR CAREER DASHBOARD"
          )
        ).toBeInTheDocument();
      });

      // ======================================
      // USER
      // ======================================

      expect(
        screen.getByText(
          "Test User"
        )
      ).toBeInTheDocument();

      // ======================================
      // CAREER
      // ======================================

      expect(
        screen.getByText(
          "Data / AI Engineer"
        )
      ).toBeInTheDocument();

      // ======================================
      // READINESS
      // ======================================

      expect(
        screen.getByRole(
          "heading",
          {
            name: "78%",
          }
        )
      ).toBeInTheDocument();

      // ======================================
      // ROADMAP PROGRESS
      //
      // 2 / 16 = 12.5%
      // Rounded by Dashboard = 13%
      // ======================================

      expect(
        screen.getByRole(
          "heading",
          {
            name: "13%",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /2 of 16 roadmap skills completed/i
        )
      ).toBeInTheDocument();

      // ======================================
      // SKILLS
      // ======================================

      expect(
        screen.getByText(
          "2 selected"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "2 / 16"
        )
      ).toBeInTheDocument();

      // ======================================
      // CAREER DETAILS
      // ======================================

      expect(
        screen.getByText(
          "Get my first job"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Intermediate"
        )
      ).toBeInTheDocument();

      // ======================================
      // NEXT ACTION
      // ======================================

      expect(
        screen.getByRole(
          "heading",
          {
            name: "SQL",
          }
        )
      ).toBeInTheDocument();

      // ======================================
      // QUICK ACTIONS
      // ======================================

      expect(
        screen.getByRole(
          "button",
          {
            name:
              /View Career Analysis/i,
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              /Continue My Roadmap/i,
          }
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
  // TEST 3: ANALYSIS FAILURE
  // ======================================

  it(
    "shows a recovery screen when career analysis fails",
    async () => {
      localStorage.setItem(
        "skillPathAssessment",
        JSON.stringify(
          testAssessment
        )
      );

      analyzeCareer.mockReturnValue(
        null
      );

      render(<Dashboard />);

      expect(
        await screen.findByRole(
          "heading",
          {
            name:
              "We couldn't build your dashboard.",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              "Retake Assessment",
          }
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
  // TEST 4: LOGOUT
  // ======================================

  it(
    "calls logout when the user clicks Log Out",
    async () => {
      const user =
        userEvent.setup();

      localStorage.setItem(
        "skillPathAssessment",
        JSON.stringify(
          testAssessment
        )
      );

      render(<Dashboard />);

      const logoutButton =
        await screen.findByRole(
          "button",
          {
            name:
              /Log Out/i,
          }
        );

      await user.click(
        logoutButton
      );

      expect(
        logoutUser
      ).toHaveBeenCalledTimes(1);
    }
  );
});