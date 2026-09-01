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
import bcrypt from "bcryptjs";

import {
  MongoMemoryServer,
} from "mongodb-memory-server";

import app from "../app.js";

import User from "../models/User.js";
import Assessment from "../models/Assessment.js";
import RoadmapProgress from "../models/RoadmapProgress.js";

let mongoServer;

let testUser;
let token;

const CURRENT_PASSWORD =
  "password123";

const NEW_PASSWORD =
  "newpassword123";

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
// TEMPORARY DATABASE
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
// CREATE USER BEFORE EACH TEST
// ======================================

beforeEach(
  async () => {
    const passwordHash =
      await bcrypt.hash(
        CURRENT_PASSWORD,
        4
      );

    testUser =
      await User.create({
        name:
          "Test User",

        email:
          "test@example.com",

        passwordHash,
      });

    token =
      createTestToken(
        testUser._id
      );
  }
);

// ======================================
// CLEAN DATABASE
// ======================================

afterEach(
  async () => {
    await Promise.all([
      User.deleteMany({}),
      Assessment.deleteMany({}),
      RoadmapProgress.deleteMany({}),
    ]);
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
  "Account Management API",
  () => {

    // ======================================
    // TEST 1: UPDATE PROFILE
    // ======================================

    it(
      "updates the authenticated user's name",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/auth/profile"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              name:
                "Updated User",
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
          "Profile updated successfully."
        );

        expect(
          response.body.user.name
        ).toBe(
          "Updated User"
        );

        expect(
          response.body.user.email
        ).toBe(
          "test@example.com"
        );

        const updatedUser =
          await User.findById(
            testUser._id
          );

        expect(
          updatedUser.name
        ).toBe(
          "Updated User"
        );
      }
    );

    // ======================================
    // TEST 2: INVALID PROFILE NAME
    // ======================================

    it(
      "rejects a profile name shorter than 2 characters",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/auth/profile"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              name: "A",
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
          "Name must contain at least 2 characters."
        );
      }
    );

    // ======================================
    // TEST 3: CHANGE PASSWORD
    // ======================================

    it(
      "changes the user's password successfully",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/auth/change-password"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              currentPassword:
                CURRENT_PASSWORD,

              newPassword:
                NEW_PASSWORD,
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
          "Password changed successfully."
        );

        const updatedUser =
          await User.findById(
            testUser._id
          ).select(
            "+passwordHash"
          );

        const oldPasswordWorks =
          await bcrypt.compare(
            CURRENT_PASSWORD,
            updatedUser.passwordHash
          );

        const newPasswordWorks =
          await bcrypt.compare(
            NEW_PASSWORD,
            updatedUser.passwordHash
          );

        expect(
          oldPasswordWorks
        ).toBe(false);

        expect(
          newPasswordWorks
        ).toBe(true);
      },
      30000
    );

    // ======================================
    // TEST 4: WRONG CURRENT PASSWORD
    // ======================================

    it(
      "rejects password change when the current password is incorrect",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/auth/change-password"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              currentPassword:
                "wrongpassword",

              newPassword:
                NEW_PASSWORD,
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
          "Current password is incorrect."
        );
      }
    );

    // ======================================
    // TEST 5: SAME PASSWORD
    // ======================================

    it(
      "rejects using the current password as the new password",
      async () => {
        const response =
          await request(app)
            .put(
              "/api/auth/change-password"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              currentPassword:
                CURRENT_PASSWORD,

              newPassword:
                CURRENT_PASSWORD,
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.message
        ).toBe(
          "New password must be different from your current password."
        );
      }
    );

    // ======================================
    // TEST 6: DELETE ACCOUNT + USER DATA
    // ======================================

    it(
      "deletes the user and all associated SkillPath data",
      async () => {
        await Assessment.create({
          user:
            testUser._id,

          education:
            "Computer Science",

          technicalSkills: [
            "Python",
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
        });

        await RoadmapProgress.create({
          user:
            testUser._id,

          completedItems: [
            "Data / AI Engineer-0-0",
          ],
        });

        const response =
          await request(app)
            .delete(
              "/api/auth/account"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              currentPassword:
                CURRENT_PASSWORD,
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
          "Your SkillPath account and associated data were deleted successfully."
        );

        const deletedUser =
          await User.findById(
            testUser._id
          );

        const assessments =
          await Assessment.find({
            user:
              testUser._id,
          });

        const roadmapProgress =
          await RoadmapProgress.findOne({
            user:
              testUser._id,
          });

        expect(
          deletedUser
        ).toBeNull();

        expect(
          assessments
        ).toHaveLength(0);

        expect(
          roadmapProgress
        ).toBeNull();
      }
    );

    // ======================================
    // TEST 7: WRONG DELETE PASSWORD
    // ======================================

    it(
      "does not delete the account when the password is incorrect",
      async () => {
        const response =
          await request(app)
            .delete(
              "/api/auth/account"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              currentPassword:
                "wrongpassword",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.message
        ).toBe(
          "Current password is incorrect."
        );

        const existingUser =
          await User.findById(
            testUser._id
          );

        expect(
          existingUser
        ).not.toBeNull();
      }
    );
  }
);