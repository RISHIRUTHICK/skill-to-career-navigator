import {
  render,
  screen,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
} from "vitest";

function TestComponent() {
  return (
    <div>
      <h1>SkillPath</h1>

      <p>
        Build your career path.
      </p>
    </div>
  );
}

describe(
  "SkillPath testing setup",
  () => {
    it(
      "renders SkillPath successfully",
      () => {
        render(
          <TestComponent />
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name: "SkillPath",
            }
          )
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Build your career path."
          )
        ).toBeInTheDocument();
      }
    );
  }
);