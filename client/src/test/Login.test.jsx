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

import Login from "../Pages/Login";

describe(
  "Login page",
  () => {
    beforeEach(() => {
      localStorage.clear();
    });

    // ======================================
    // TEST 1: PAGE RENDERS
    // ======================================

    it(
      "renders the login form",
      () => {
        render(<Login />);

        expect(
          screen.getByText(
            "WELCOME BACK"
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
          screen.getByRole(
            "button",
            {
              name: "Log In",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            "button",
            {
              name:
                "Create account",
            }
          )
        ).toBeInTheDocument();
      }
    );

    // ======================================
    // TEST 2: BUTTON VALIDATION
    // ======================================

    it(
      "enables login after email and password are entered",
      async () => {
        const user =
          userEvent.setup();

        render(<Login />);

        const emailInput =
          screen.getByLabelText(
            "Email Address"
          );

        const passwordInput =
          screen.getByLabelText(
            "Password"
          );

        const loginButton =
          screen.getByRole(
            "button",
            {
              name: "Log In",
            }
          );

        expect(
          loginButton
        ).toBeDisabled();

        await user.type(
          emailInput,
          "test@example.com"
        );

        await user.type(
          passwordInput,
          "password123"
        );

        expect(
          loginButton
        ).toBeEnabled();
      }
    );

    // ======================================
    // TEST 3: INVALID EMAIL
    // ======================================

    it(
      "shows an error for an invalid email address",
      async () => {
        const user =
          userEvent.setup();

        render(<Login />);

        await user.type(
          screen.getByLabelText(
            "Email Address"
          ),
          "invalid-email"
        );

        await user.type(
          screen.getByLabelText(
            "Password"
          ),
          "password123"
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: "Log In",
            }
          )
        );

        expect(
          screen.getByText(
            "Please enter a valid email address."
          )
        ).toBeInTheDocument();
      }
    );
  }
);