import {
  describe,
  expect,
  it,
} from "vitest";

import request from "supertest";

import app from "../app.js";

describe(
  "Health API",
  () => {
    it(
      "returns SkillPath API health information",
      async () => {
        const response =
          await request(app)
            .get("/api/health");

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "SkillPath API is running"
        );

        expect(
          response.body.database
        ).toBe(
          "disconnected"
        );
      }
    );

    it(
      "returns 404 for an unknown API route",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/does-not-exist"
            );

        expect(
          response.status
        ).toBe(404);

        expect(
          response.body
        ).toEqual({
          success: false,
          message:
            "API route not found.",
        });
      }
    );
  }
);