import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import Assessment from "../Pages/Assessment";

describe("Assessment page", () => {
  beforeEach(() => {
    localStorage.clear();

    window.scrollTo =
      vi.fn();
  });

  // ======================================
  // TEST 1: STEP 1 RENDERS
  // ======================================

  it(
    "renders the first assessment step",
    () => {
      render(<Assessment />);

      expect(
        screen.getByText(
          "STEP 1 OF 6"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "heading",
          {
            name:
              "What are you currently studying?",
          }
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name: /Continue/i,
          }
        )
      ).toBeDisabled();
    }
  );

  // ======================================
  // TEST 2: MOVE TO STEP 2
  // ======================================

  it(
    "moves to technical skills after selecting education",
    async () => {
      const user =
        userEvent.setup();

      render(<Assessment />);

      const educationOption =
        screen.getByRole(
          "button",
          {
            name:
              "Computer Science",
          }
        );

      await user.click(
        educationOption
      );

      expect(
        educationOption
      ).toHaveClass(
        "selected"
      );

      const continueButton =
        screen.getByRole(
          "button",
          {
            name: /Continue/i,
          }
        );

      expect(
        continueButton
      ).toBeEnabled();

      await user.click(
        continueButton
      );

      expect(
        screen.getByText(
          "STEP 2 OF 6"
        )
      ).toBeInTheDocument();

      const technicalSkillHeadings =
        screen.getAllByRole(
          "heading",
          {
            name:
              "Which technical skills do you have?",
          }
        );

      expect(
        technicalSkillHeadings
      ).toHaveLength(2);
    }
  );

  // ======================================
  // TEST 3: MULTIPLE SKILLS
  // ======================================

  it(
    "allows multiple technical skills to be selected",
    async () => {
      const user =
        userEvent.setup();

      render(<Assessment />);

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

      const pythonButton =
        screen.getByRole(
          "button",
          {
            name: "Python",
          }
        );

      const reactButton =
        screen.getByRole(
          "button",
          {
            name: "React",
          }
        );

      await user.click(
        pythonButton
      );

      await user.click(
        reactButton
      );

      expect(
        pythonButton
      ).toHaveClass(
        "selected"
      );

      expect(
        reactButton
      ).toHaveClass(
        "selected"
      );

      expect(
        screen.getByText(
          "2 skills selected"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name: /Continue/i,
          }
        )
      ).toBeEnabled();
    }
  );

  // ======================================
  // TEST 4: PREVIOUS STEP
  // ======================================

  it(
    "returns to the previous step and preserves the education selection",
    async () => {
      const user =
        userEvent.setup();

      render(<Assessment />);

      await user.click(
        screen.getByRole(
          "button",
          {
            name:
              "Information Technology",
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

      expect(
        screen.getByText(
          "STEP 2 OF 6"
        )
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole(
          "button",
          {
            name: "Previous",
          }
        )
      );

      expect(
        screen.getByText(
          "STEP 1 OF 6"
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole(
          "button",
          {
            name:
              "Information Technology",
          }
        )
      ).toHaveClass(
        "selected"
      );

      expect(
        screen.getByRole(
          "button",
          {
            name: /Continue/i,
          }
        )
      ).toBeEnabled();
    }
  );
});