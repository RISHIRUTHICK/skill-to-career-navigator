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
// MOCK CAREER ANALYSIS
// ======================================

vi.mock(
  "../utils/careerAnalysis",
  () => ({
    analyzeCareer: vi.fn(() => ({
      recommendedCareer:
        "Data / AI Engineer",

      readinessScore: 78,
    })),
  })
);

// ======================================
// MOCK AUTH
// ======================================

vi.mock(
  "../utils/auth",
  () => ({
    getAuthToken: vi.fn(),
    clearAuthSession: vi.fn(),
  })
);

import {
  getAuthToken,
} from "../utils/auth";

import Assessment from "../Pages/Assessment";

// ======================================
// COMPLETE ALL SIX STEPS
// ======================================

async function completeAssessment(
  user
) {
  // STEP 1
  await user.click(
    screen.getByRole(
      "button",
      {
        name:
          "Computer Science",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name: /Continue/i,
      }
    )
  );

  // STEP 2
  await user.click(
    screen.getByRole(
      "button",
      {
        name: "Python",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name:
          "Machine Learning",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name: /Continue/i,
      }
    )
  );

  // STEP 3
  await user.click(
    screen.getByRole(
      "button",
      {
        name:
          "Internship experience",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name: /Continue/i,
      }
    )
  );

  // STEP 4
  await user.click(
    screen.getByRole(
      "button",
      {
        name:
          "Intermediate",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name: /Continue/i,
      }
    )
  );

  // STEP 5
  await user.click(
    screen.getByRole(
      "button",
      {
        name: "Data & AI",
      }
    )
  );

  await user.click(
    screen.getByRole(
      "button",
      {
        name: /Continue/i,
      }
    )
  );

  // STEP 6
  await user.click(
    screen.getByRole(
      "button",
      {
        name:
          "Get my first job",
      }
    )
  );
}

describe(
  "Assessment submission",
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      localStorage.clear();

      window.scrollTo =
        vi.fn();

     globalThis.fetch =
  vi.fn();
    });

    // ======================================
    // TEST 1: COMPLETE + SAVE TO SERVER
    // ======================================

    it(
      "saves a completed assessment locally and sends it to the backend",
      async () => {
        const user =
          userEvent.setup();

        getAuthToken.mockReturnValue(
          "test-token"
        );

        fetch.mockResolvedValue({
          ok: true,
          status: 201,

          json: vi.fn().mockResolvedValue({
            success: true,

            assessment: {
              _id:
                "assessment-123",
            },
          }),
        });

        render(<Assessment />);

        await completeAssessment(
          user
        );

        expect(
          screen.getByText(
            "STEP 6 OF 6"
          )
        ).toBeInTheDocument();

        const finishButton =
          screen.getByRole(
            "button",
            {
              name:
                /Finish Assessment/i,
            }
          );

        expect(
          finishButton
        ).toBeEnabled();

        await user.click(
          finishButton
        );

        await waitFor(() => {
          expect(
            fetch
          ).toHaveBeenCalledTimes(
            1
          );
        });

        // ======================================
        // CHECK API REQUEST
        // ======================================

        expect(
          fetch
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "/api/assessments"
          ),
          expect.objectContaining({
            method: "POST",

            headers:
              expect.objectContaining({
                "Content-Type":
                  "application/json",

                Authorization:
                  "Bearer test-token",
              }),
          })
        );

        // ======================================
        // CHECK REQUEST BODY
        // ======================================

        const fetchOptions =
          fetch.mock.calls[0][1];

        const requestBody =
          JSON.parse(
            fetchOptions.body
          );

        expect(
          requestBody
        ).toEqual(
          expect.objectContaining({
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

            recommendedCareer:
              "Data / AI Engineer",

            readinessScore: 78,
          })
        );

        // ======================================
        // CHECK LOCAL ASSESSMENT
        // ======================================

        const savedAssessment =
          JSON.parse(
            localStorage.getItem(
              "skillPathAssessment"
            )
          );

        expect(
          savedAssessment
        ).toEqual(
          expect.objectContaining({
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
          })
        );

        // ======================================
        // CHECK MONGODB ID
        // ======================================

        expect(
          localStorage.getItem(
            "skillPathAssessmentId"
          )
        ).toBe(
          "assessment-123"
        );

        // ======================================
        // NO PENDING SYNC
        // ======================================

        expect(
          localStorage.getItem(
            "skillPathSyncPending"
          )
        ).toBeNull();
      },
      20000
    );

    // ======================================
    // TEST 2: NO TOKEN / LOCAL FALLBACK
    // ======================================

    it(
      "keeps the assessment locally and marks it for sync when no login token exists",
      async () => {
        const user =
          userEvent.setup();

        getAuthToken.mockReturnValue(
          null
        );

        render(<Assessment />);

        await completeAssessment(
          user
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name:
                /Finish Assessment/i,
            }
          )
        );

        await waitFor(() => {
          expect(
            localStorage.getItem(
              "skillPathSyncPending"
            )
          ).toBe("true");
        });

        // ======================================
        // LOCAL ASSESSMENT EXISTS
        // ======================================

        const savedAssessment =
          JSON.parse(
            localStorage.getItem(
              "skillPathAssessment"
            )
          );

        expect(
          savedAssessment
        ).toEqual(
          expect.objectContaining({
            education:
              "Computer Science",

            careerInterest:
              "Data & AI",

            goal:
              "Get my first job",
          })
        );

        // ======================================
        // NO BACKEND REQUEST WITHOUT TOKEN
        // ======================================

        expect(
          fetch
        ).not.toHaveBeenCalled();
      },
      20000
    );
  }
);