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
import Assessment from "../models/Assessment.js";

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
// CREATE JWT
// ======================================

function createTestToken(
  userId
) {
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
    await Assessment.deleteMany(
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

// ======================================
// ASSESSMENT DATA
// ======================================

const validAssessment = {
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

  recommendedCareer:
    "Data / AI Engineer",

  readinessScore: 78,
};

describe(
  "Assessment API",
  () => {

    // ======================================
    // TEST 1: PROTECTED
    // ======================================

    it(
      "blocks assessment creation without a JWT",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/assessments"
            )
            .send(
              validAssessment
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
    // TEST 2: SAVE ASSESSMENT
    // ======================================

    it(
      "saves an assessment for the authenticated user",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/assessments"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
            )
            .send(
              validAssessment
            );

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.message
        ).toBe(
          "Assessment saved successfully"
        );

        expect(
          response.body.assessment
            .education
        ).toBe(
          "Computer Science"
        );

        expect(
          response.body.assessment
            .technicalSkills
        ).toEqual([
          "Python",
          "Machine Learning",
        ]);

        expect(
          response.body.assessment
            .recommendedCareer
        ).toBe(
          "Data / AI Engineer"
        );

        expect(
          response.body.assessment
            .readinessScore
        ).toBe(78);

        // ======================================
        // VERIFY DATABASE OWNERSHIP
        // ======================================

        const savedAssessment =
          await Assessment.findOne({
            user:
              userOne._id,
          });

        expect(
          savedAssessment
        ).not.toBeNull();

        expect(
          savedAssessment.user
            .toString()
        ).toBe(
          userOne._id.toString()
        );

        expect(
          savedAssessment.goal
        ).toBe(
          "Get my first job"
        );
      }
    );

    // ======================================
    // TEST 3: VALIDATION
    // ======================================

    it(
      "rejects incomplete assessment information",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/assessments"
            )
            .set(
              "Authorization",
              `Bearer ${tokenOne}`
            )
            .send({
              education:
                "Computer Science",
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
          "Please provide all required assessment information."
        );
      }
    );

    // ======================================
    // TEST 4: GET LATEST
    // ======================================

    it(
      "returns the authenticated user's latest assessment",
      async () => {
        await request(app)
          .post(
            "/api/assessments"
          )
          .set(
            "Authorization",
            `Bearer ${tokenOne}`
          )
          .send({
            ...validAssessment,

            careerInterest:
              "Software Development",

            recommendedCareer:
              "Software Developer",

            readinessScore: 60,
          });

        // Ensure different createdAt values
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              20
            )
        );

        await request(app)
          .post(
            "/api/assessments"
          )
          .set(
            "Authorization",
            `Bearer ${tokenOne}`
          )
          .send({
            ...validAssessment,

            careerInterest:
              "Data & AI",

            recommendedCareer:
              "Data / AI Engineer",

            readinessScore: 82,
          });

        const response =
          await request(app)
            .get(
              "/api/assessments/latest"
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
          response.body.assessment
            .recommendedCareer
        ).toBe(
          "Data / AI Engineer"
        );

        expect(
          response.body.assessment
            .readinessScore
        ).toBe(82);
      }
    );

    // ======================================
    // TEST 5: USER DATA ISOLATION
    // ======================================

    it(
      "does not return another user's assessment",
      async () => {
        await request(app)
          .post(
            "/api/assessments"
          )
          .set(
            "Authorization",
            `Bearer ${tokenOne}`
          )
          .send(
            validAssessment
          );

        const response =
          await request(app)
            .get(
              "/api/assessments/latest"
            )
            .set(
              "Authorization",
              `Bearer ${tokenTwo}`
            );

        expect(
          response.status
        ).toBe(404);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.message
        ).toBe(
          "No assessment data found for this user."
        );
      }
    );
  }
);