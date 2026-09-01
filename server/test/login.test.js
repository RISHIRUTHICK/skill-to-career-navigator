import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import {
  MongoMemoryServer,
} from "mongodb-memory-server";

import app from "../app.js";
import User from "../models/User.js";

let mongoServer;

// ======================================
// TEST JWT SECRET
// ======================================

process.env.JWT_SECRET =
  "skillpath-test-jwt-secret";

// ======================================
// TEMPORARY TEST DATABASE
// ======================================

beforeAll(
  async () => {
    mongoServer =
      await MongoMemoryServer.create();

    await mongoose.connect(
      mongoServer.getUri()
    );
  },
  300000
);

// ======================================
// CREATE TEST USER BEFORE EACH TEST
// ======================================

beforeEach(
  async () => {
    const passwordHash =
      await bcrypt.hash(
        "password123",
        4
      );

    await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
    });
  }
);

// ======================================
// CLEAN TEST DATABASE
// ======================================

afterEach(
  async () => {
    await User.deleteMany({});
  }
);

// ======================================
// CLOSE TEST DATABASE
// ======================================

afterAll(
  async () => {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  },
  30000
);

describe(
  "Login and JWT authentication",
  () => {

    // ======================================
    // TEST 1: SUCCESSFUL LOGIN
    // ======================================

    it(
      "logs in with valid credentials",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "TEST@EXAMPLE.COM",

              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "Login successful."
        );

        expect(
          response.body.token
        ).toBeDefined();

        expect(
          typeof response.body.token
        ).toBe("string");

        expect(
          response.body.user
        ).toEqual(
          expect.objectContaining({
            name: "Test User",
            email:
              "test@example.com",
          })
        );

        expect(
          response.body.user
            .passwordHash
        ).toBeUndefined();
      }
    );

    // ======================================
    // TEST 2: WRONG PASSWORD
    // ======================================

    it(
      "rejects an incorrect password",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "test@example.com",

              password:
                "wrongpassword",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.message
        ).toBe(
          "Invalid email or password."
        );
      }
    );

    // ======================================
    // TEST 3: UNKNOWN USER
    // ======================================

    it(
      "rejects an unknown email address",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "missing@example.com",

              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.message
        ).toBe(
          "Invalid email or password."
        );
      }
    );

    // ======================================
    // TEST 4: PROTECTED ROUTE WITHOUT JWT
    // ======================================

    it(
      "blocks access to the current-user route without a token",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/auth/me"
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.message
        ).toBe(
          "Authentication required."
        );
      }
    );

    // ======================================
    // TEST 5: VALID JWT
    // ======================================

    it(
      "returns the current user with a valid JWT",
      async () => {
        // LOGIN FIRST
        const loginResponse =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "test@example.com",

              password:
                "password123",
            });

        expect(
          loginResponse.status
        ).toBe(200);

        const token =
          loginResponse.body.token;

        // ACCESS PROTECTED API
        const response =
          await request(app)
            .get(
              "/api/auth/me"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "User retrieved successfully."
        );

        expect(
          response.body.user
        ).toEqual(
          expect.objectContaining({
            name: "Test User",
            email:
              "test@example.com",
          })
        );

        expect(
          response.body.user
            .passwordHash
        ).toBeUndefined();
      }
    );
  }
);