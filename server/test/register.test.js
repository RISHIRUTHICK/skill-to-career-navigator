import {
  afterAll,
  afterEach,
  beforeAll,
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
// TEMPORARY TEST DATABASE
// ======================================

beforeAll(
  async () => {
    mongoServer =
      await MongoMemoryServer.create();

    const mongoUri =
      mongoServer.getUri();

    await mongoose.connect(
      mongoUri
    );
  },
  300000
);

// ======================================
// CLEAN DATABASE AFTER EACH TEST
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
  "Register API",
  () => {
    // ======================================
    // TEST 1: CREATE ACCOUNT
    // ======================================

    it(
      "creates a new user successfully",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send({
              name:
                "Test User",

              email:
                "TEST@EXAMPLE.COM",

              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "Account created successfully."
        );

        expect(
          response.body.user.name
        ).toBe(
          "Test User"
        );

        expect(
          response.body.user.email
        ).toBe(
          "test@example.com"
        );

        expect(
          response.body.user.id
        ).toBeDefined();

        // Password must never be returned
        expect(
          response.body.user
            .passwordHash
        ).toBeUndefined();

        // ======================================
        // VERIFY DATABASE USER
        // ======================================

        const savedUser =
          await User.findOne({
            email:
              "test@example.com",
          }).select(
            "+passwordHash"
          );

        expect(
          savedUser
        ).not.toBeNull();

        expect(
          savedUser.passwordHash
        ).not.toBe(
          "password123"
        );

        const passwordMatches =
          await bcrypt.compare(
            "password123",
            savedUser.passwordHash
          );

        expect(
          passwordMatches
        ).toBe(true);
      },
      30000
    );

    // ======================================
    // TEST 2: DUPLICATE EMAIL
    // ======================================

    it(
      "rejects duplicate email registration",
      async () => {
        const account = {
          name:
            "Test User",

          email:
            "test@example.com",

          password:
            "password123",
        };

        const firstResponse =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send(account);

        expect(
          firstResponse.status
        ).toBe(201);

        const secondResponse =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send(account);

        expect(
          secondResponse.status
        ).toBe(409);

        expect(
          secondResponse.body
            .success
        ).toBe(false);

        expect(
          secondResponse.body
            .message
        ).toBe(
          "An account with this email already exists."
        );
      },
      30000
    );

    // ======================================
    // TEST 3: INVALID EMAIL
    // ======================================

    it(
      "rejects an invalid email address",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send({
              name:
                "Test User",

              email:
                "invalid-email",

              password:
                "password123",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.message
        ).toBe(
          "Please enter a valid email address."
        );
      }
    );

    // ======================================
    // TEST 4: SHORT PASSWORD
    // ======================================

    it(
      "rejects a password shorter than 8 characters",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send({
              name:
                "Test User",

              email:
                "test@example.com",

              password:
                "1234567",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.message
        ).toBe(
          "Password must contain at least 8 characters."
        );
      }
    );
  }
);