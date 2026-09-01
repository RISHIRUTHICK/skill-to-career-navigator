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
import jwt from "jsonwebtoken";

import {
  MongoMemoryServer,
} from "mongodb-memory-server";

import app from "../app.js";

import User from "../models/User.js";
import RoadmapProgress from "../models/RoadmapProgress.js";

let mongoServer;

let userOne;
let userTwo;

let tokenOne;
let tokenTwo;

// ======================================
// TEST JWT SECRET
// ======================================

process.env.JWT_SECRET =
  "skillpath-test-jwt-secret";

// ======================================
// CREATE TEST JWT
// ======================================

function createTestToken(userId) {
  return jwt.sign(
    {
      userId:
        userId.toString(),
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "1h",
    }
  );
}

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
// CREATE TEST USERS
// ======================================

beforeEach(
  async () => {
    userOne =
      await User.create({
        name:
          "User One",

        email:
          "userone@example.com",

        passwordHash:
          "test-password-hash",
      });

    userTwo =
      await User.create({
        name:
          "User Two",

        email:
          "usertwo@example.com",

        passwordHash:
          "test-password-hash",
      });

    tokenOne =
      createTestToken(
        userOne._id
      );

    tokenTwo =
      createTestToken(
        userTwo._id
      );
  }
);

// ======================================
// CLEAN DATABASE
// ======================================

afterEach(
  async () => {
    await RoadmapProgress.deleteMany(
      {}
    );

    await User.deleteMany(
      {}
    );
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
  "Roadmap Progress API",
  () => {

    // ======================================
    // TEST 1: PROTECTED ROUTE
    // ======================================

    it(
      "blocks roadmap access without a JWT",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/roadmap-progress"
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
    // TEST 2: EMPTY PROGRESS
    // ======================================

    it(
      "returns empty progress for a user with no saved roadmap",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/roadmap-progress"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
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
          "No roadmap progress found yet."
        );

        expect(
          response.body.completedItems
        ).toEqual([]);
      }
    );

    // ======================================
    // TEST 3: SAVE + CLEAN PROGRESS
    // ======================================

    it(
      "saves roadmap progress and removes duplicates or invalid items",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/roadmap-progress"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
            )
            .send({
              completedItems: [
                "Data / AI Engineer-0-0",
                "Data / AI Engineer-0-1",
                "Data / AI Engineer-0-0",
                "   Data / AI Engineer-1-0   ",
                "",
                "   ",
                null,
                123,
              ],
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
          "Roadmap progress saved successfully."
        );

        expect(
          response.body.completedItems
        ).toEqual([
          "Data / AI Engineer-0-0",
          "Data / AI Engineer-0-1",
          "Data / AI Engineer-1-0",
        ]);

        // ======================================
        // VERIFY DATABASE
        // ======================================

        const savedProgress =
          await RoadmapProgress.findOne({
            user:
              userOne._id,
          });

        expect(
          savedProgress
        ).not.toBeNull();

        expect(
          savedProgress.user.toString()
        ).toBe(
          userOne._id.toString()
        );

        expect(
          savedProgress.completedItems
        ).toEqual([
          "Data / AI Engineer-0-0",
          "Data / AI Engineer-0-1",
          "Data / AI Engineer-1-0",
        ]);
      }
    );

    // ======================================
    // TEST 4: GET SAVED PROGRESS
    // ======================================

    it(
      "returns previously saved roadmap progress",
      async () => {
        await request(app)
          .put(
            "/api/roadmap-progress"
          )
          .set(
            "Authorization",
            `Bearer ${tokenOne}`
          )
          .send({
            completedItems: [
              "Data / AI Engineer-0-0",
              "Data / AI Engineer-0-1",
            ],
          });

        const response =
          await request(app)
            .get(
              "/api/roadmap-progress"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
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
          "Roadmap progress retrieved successfully."
        );

        expect(
          response.body.completedItems
        ).toEqual([
          "Data / AI Engineer-0-0",
          "Data / AI Engineer-0-1",
        ]);
      }
    );

    // ======================================
    // TEST 5: INVALID DATA
    // ======================================

    it(
      "rejects completedItems when it is not an array",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/roadmap-progress"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
            )
            .send({
              completedItems:
                "not-an-array",
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.message
        ).toBe(
          "completedItems must be an array."
        );
      }
    );

    // ======================================
    // TEST 6: USER ISOLATION
    // ======================================

    it(
      "keeps roadmap progress isolated between users",
      async () => {
        await request(app)
          .put(
            "/api/roadmap-progress"
          )
          .set(
            "Authorization",
            `Bearer ${tokenOne}`
          )
          .send({
            completedItems: [
              "Data / AI Engineer-0-0",
              "Data / AI Engineer-0-1",
            ],
          });

        const userTwoResponse =
          await request(app)
            .get(
              "/api/roadmap-progress"
            )
            .set(
              "Authorization",
              `Bearer ${tokenTwo}`
            );

        expect(
          userTwoResponse.status
        ).toBe(200);

        expect(
          userTwoResponse.body
            .completedItems
        ).toEqual([]);

        expect(
          userTwoResponse.body.message
        ).toBe(
          "No roadmap progress found yet."
        );
      }
    );
  }
);