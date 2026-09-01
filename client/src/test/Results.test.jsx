import {
  render,
  screen,
} from "@testing-library/react";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

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
  analyzeCareer,
} from "../utils/careerAnalysis";

import Results from "../Pages/Results";

describe("Results page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ======================================
  // TEST 1: NO ASSESSMENT
  // ======================================

  it(
    "shows an empty state when no assessment exists",
    () => {
      render(<Results />);

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "No assessment data found.",
          }
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
    }
  );

  // ======================================
  // TEST 2: VALID RESULTS
  // ======================================

  it(
    "displays the career recommendation and assessment results",
    () => {
      const assessment = {
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

      localStorage.setItem(
        "skillPathAssessment",
        JSON.stringify(
          assessment
        )
      );

      analyzeCareer.mockReturnValue({
        recommendedCareer:
          "Data / AI Engineer",

        readinessScore: 78,

        skills: [
          "Python",
          "Machine Learning",
        ],

        strengths: [
          "Python foundation",
          "Problem-solving ability",
        ],

        skillGaps: [
          "SQL",
          "Cloud Computing",
        ],
      });

      render(<Results />);

      // ======================================
      // ANALYSIS CALLED
      // ======================================

      expect(
        analyzeCareer
      ).toHaveBeenCalledWith(
        assessment
      );

      // ======================================
      // CAREER
      // ======================================

      expect(
        screen.getByText(
          "YOUR CAREER ANALYSIS"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Data / AI Engineer"
        )
      ).toBeInTheDocument();

      // ======================================
      // READINESS
      // ======================================

      expect(
        screen.getByText(
          "78%"
        )
      ).toBeInTheDocument();

      // ======================================
      // STRENGTHS
      // ======================================

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Your Strengths",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Python foundation"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Problem-solving ability"
        )
      ).toBeInTheDocument();

      // ======================================
      // SKILL GAPS
      // ======================================

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Skills To Improve",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "SQL"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Cloud Computing"
        )
      ).toBeInTheDocument();

      // ======================================
      // ASSESSMENT SUMMARY
      // ======================================

      expect(
        screen.getByText(
          "Computer Science"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "2 skills selected"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Internship experience"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Intermediate"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Data & AI"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "Get my first job"
        )
      ).toBeInTheDocument();

      // ======================================
      // ROADMAP BUTTON
      // ======================================

      expect(
        screen.getByRole(
          "button",
          {
            name:
              /View My Roadmap/i,
          }
        )
      ).toBeInTheDocument();
    }
  );

  // ======================================
  // TEST 3: ANALYSIS FAILURE
  // ======================================

  it(
    "shows an error state when career analysis cannot be created",
    () => {
      localStorage.setItem(
        "skillPathAssessment",
        JSON.stringify({
          education:
            "Computer Science",
        })
      );

      analyzeCareer.mockReturnValue(
        null
      );

      render(<Results />);

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Unable to analyze your results.",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              /Retake Assessment/i,
          }
        )
      ).toBeInTheDocument();
    }
  );
});