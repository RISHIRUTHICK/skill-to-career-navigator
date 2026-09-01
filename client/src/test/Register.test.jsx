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
} from "vitest";

import Register from "../Pages/Register";

describe("Register page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ======================================
  // TEST 1: PAGE RENDERS
  // ======================================

  it("renders the registration form", () => {
    render(<Register />);

    expect(
      screen.getByText(
        "CREATE YOUR ACCOUNT"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Full Name"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Email Address"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Password"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Confirm Password"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Create Account",
        }
      )
    ).toBeInTheDocument();
  });

  // ======================================
  // TEST 2: VALID FORM ENABLES BUTTON
  // ======================================

  it(
    "enables account creation when valid details are entered",
    async () => {
      const user =
        userEvent.setup();

      render(<Register />);

      const createButton =
        screen.getByRole(
          "button",
          {
            name: "Create Account",
          }
        );

      expect(
        createButton
      ).toBeDisabled();

      await user.type(
        screen.getByLabelText(
          "Full Name"
        ),
        "Test User"
      );

      await user.type(
        screen.getByLabelText(
          "Email Address"
        ),
        "test@example.com"
      );

      await user.type(
        screen.getByLabelText(
          "Password"
        ),
        "password123"
      );

      await user.type(
        screen.getByLabelText(
          "Confirm Password"
        ),
        "password123"
      );

      expect(
        createButton
      ).toBeEnabled();
    }
  );

  // ======================================
  // TEST 3: PASSWORD VISIBILITY
  // ======================================

  it(
    "toggles password visibility",
    async () => {
      const user =
        userEvent.setup();

      render(<Register />);

      const passwordInput =
        screen.getByLabelText(
          "Password"
        );

      expect(
        passwordInput
      ).toHaveAttribute(
        "type",
        "password"
      );

      await user.click(
        screen.getByRole(
          "button",
          {
            name:
              "Show password",
          }
        )
      );

      expect(
        passwordInput
      ).toHaveAttribute(
        "type",
        "text"
      );

      expect(
        screen.getByRole(
          "button",
          {
            name:
              "Hide password",
          }
        )
      ).toBeInTheDocument();
    }
  );
});