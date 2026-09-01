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
    getAuthToken: vi.fn(),
    clearAuthSession: vi.fn(),
  })
);

import {
  getAuthToken,
} from "../utils/auth";

import Roadmap from "../Pages/Roadmap";

// ======================================
// SAVE TEST ASSESSMENT
// ======================================

function saveAssessment(
  overrides = {}
) {
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

    ...overrides,
  };

  localStorage.setItem(
    "skillPathAssessment",
    JSON.stringify(
      assessment
    )
  );

  return assessment;
}

describe("Roadmap page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    getAuthToken.mockReturnValue(
      "test-token"
    );

    globalThis.fetch =
  vi.fn();
  });

  // ======================================
  // TEST 1: ROADMAP RENDERS
  // ======================================

  it(
    "loads the correct roadmap from the saved assessment",
    async () => {
      saveAssessment();

      fetch.mockResolvedValue({
        ok: true,
        status: 200,

        json:
          vi.fn().mockResolvedValue({
            success: true,
            completedItems: [],
          }),
      });

      render(<Roadmap />);

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Loading your roadmap...",
          }
        )
      ).toBeInTheDocument();

      await screen.findByText(
        "YOUR PERSONALIZED ROADMAP"
      );

      expect(
        screen.getByText(
          "Data / AI Engineer"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name: "0%",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "0 of 16 completed"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Build Data Foundations",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Learn Data Analysis",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Master Machine Learning",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "Build AI Projects",
          }
        )
      ).toBeInTheDocument();
    }
  );

  // ======================================
  // TEST 2: RESTORE SAVED PROGRESS
  // ======================================

  it(
    "restores completed roadmap skills from the backend",
    async () => {
      saveAssessment();

      const serverProgress = [
        "Data / AI Engineer-0-0",
        "Data / AI Engineer-0-1",
      ];

      fetch.mockResolvedValue({
        ok: true,
        status: 200,

        json:
          vi.fn().mockResolvedValue({
            success: true,
            completedItems:
              serverProgress,
          }),
      });

      render(<Roadmap />);

      await screen.findByText(
        "YOUR PERSONALIZED ROADMAP"
      );

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
          "2 of 16 completed"
        )
      ).toBeInTheDocument();

      const pythonButton =
        screen.getByRole(
          "button",
          {
            name: /Python/i,
          }
        );

      const sqlButton =
        screen.getByRole(
          "button",
          {
            name: /SQL/i,
          }
        );

      expect(
        pythonButton
      ).toHaveClass(
        "completed"
      );

      expect(
        sqlButton
      ).toHaveClass(
        "completed"
      );

      expect(
        JSON.parse(
          localStorage.getItem(
            "skillPathRoadmapProgress"
          )
        )
      ).toEqual(
        serverProgress
      );
    }
  );

  // ======================================
  // TEST 3: COMPLETE A ROADMAP SKILL
  // ======================================

  it(
    "updates progress and saves a completed skill",
    async () => {
      const user =
        userEvent.setup();

      saveAssessment({
        technicalSkills: [],
      });

      fetch.mockImplementation(
        async (
          _url,
          options = {}
        ) => {
          // LOAD PROGRESS
          if (
            options.method !==
            "PUT"
          ) {
            return {
              ok: true,
              status: 200,

              json:
                vi
                  .fn()
                  .mockResolvedValue({
                    success: true,
                    completedItems:
                      [],
                  }),
            };
          }

          // SAVE PROGRESS
          const requestBody =
            JSON.parse(
              options.body
            );

          return {
            ok: true,
            status: 200,

            json:
              vi
                .fn()
                .mockResolvedValue({
                  success: true,
                  completedItems:
                    requestBody
                      .completedItems,
                }),
          };
        }
      );

      render(<Roadmap />);

      await screen.findByText(
        "YOUR PERSONALIZED ROADMAP"
      );

      const pythonButton =
        screen.getByRole(
          "button",
          {
            name: "Python",
          }
        );

      await user.click(
        pythonButton
      );

      await waitFor(() => {
        expect(
          screen.getByRole(
            "heading",
            {
              name: "6%",
            }
          )
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          "1 of 16 completed"
        )
      ).toBeInTheDocument();

      expect(
        pythonButton
      ).toHaveClass(
        "completed"
      );

      // ======================================
      // GET + PUT
      // ======================================

      await waitFor(() => {
        expect(
          fetch
        ).toHaveBeenCalledTimes(
          2
        );
      });

      const putCall =
        fetch.mock.calls.find(
          ([, options]) =>
            options?.method ===
            "PUT"
        );

      expect(
        putCall
      ).toBeDefined();

      const putBody =
        JSON.parse(
          putCall[1].body
        );

      expect(
        putBody.completedItems
      ).toContain(
        "Data / AI Engineer-0-0"
      );

      await waitFor(() => {
        const savedProgress =
          JSON.parse(
            localStorage.getItem(
              "skillPathRoadmapProgress"
            )
          );

        expect(
          savedProgress
        ).toContain(
          "Data / AI Engineer-0-0"
        );
      });

      expect(
        localStorage.getItem(
          "skillPathRoadmapSyncPending"
        )
      ).toBeNull();
    }
  );

  // ======================================
  // TEST 4: NO ASSESSMENT
  // ======================================

  it(
    "shows an empty state when no assessment exists",
    async () => {
      fetch.mockResolvedValue({
        ok: true,
        status: 200,

        json:
          vi.fn().mockResolvedValue({
            success: true,
            completedItems: [],
          }),
      });

      render(<Roadmap />);

      expect(
        await screen.findByRole(
          "heading",
          {
            name:
              "No career assessment found",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              "Start Assessment",
          }
        )
      ).toBeInTheDocument();
    }
  );
});