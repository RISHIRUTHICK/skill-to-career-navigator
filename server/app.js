const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Assessment = require("./models/Assessment");
const User = require("./models/User");
const RoadmapProgress =
  require("./models/RoadmapProgress");

const protect =
  require("./middleware/authMiddleware");

const app = express();

// ======================================
// SECURITY MIDDLEWARE
// ======================================

// Secure HTTP response headers
app.use(
  helmet()
);

// Allow requests only from the frontend
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Limit JSON request body size
app.use(
  express.json({
    limit: "100kb",
  })
);

// ======================================
// GLOBAL API RATE LIMIT
// ======================================

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 200,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },
  });

app.use(
  "/api",
  apiLimiter
);

// ======================================
// AUTHENTICATION RATE LIMIT
// ======================================

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 30,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });

// ======================================
// HEALTH CHECK
// GET /api/health
// ======================================

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "SkillPath API is running",

      database:
        mongoose.connection
          .readyState === 1
          ? "connected"
          : "disconnected",
    });
  }
);

// ======================================
// CREATE JWT TOKEN
// ======================================

function createToken(userId) {
  if (
    !process.env.JWT_SECRET
  ) {
    throw new Error(
      "JWT_SECRET is missing from the .env file"
    );
  }

  return jwt.sign(
    {
      userId,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
}

// ======================================
// REGISTER USER
// POST /api/auth/register
// ======================================

app.post(
  "/api/auth/register",

  authLimiter,

  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name, email and password are required.",
          });
      }

      const cleanName =
        name.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (
        cleanName.length < 2
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name must contain at least 2 characters.",
          });
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please enter a valid email address.",
          });
      }

      if (
        password.length < 8
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Password must contain at least 8 characters.",
          });
      }

      const existingUser =
        await User.findOne({
          email:
            cleanEmail,
        });

      if (existingUser) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "An account with this email already exists.",
          });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const newUser =
        await User.create({
          name:
            cleanName,

          email:
            cleanEmail,

          passwordHash,
        });

      res
        .status(201)
        .json({
          success: true,

          message:
            "Account created successfully.",

          user: {
            id:
              newUser._id,

            name:
              newUser.name,

            email:
              newUser.email,

            createdAt:
              newUser.createdAt,
          },
        });
    } catch (error) {
      console.error(
        "Unable to register user:",
        error.message
      );

      if (
        error?.code === 11000
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "An account with this email already exists.",
          });
      }

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid account information.",

            error:
              error.message,
          });
      }

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to create account.",
        });
    }
  }
);

// ======================================
// LOGIN USER
// POST /api/auth/login
// ======================================

app.post(
  "/api/auth/login",

  authLimiter,

  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and password are required.",
          });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            cleanEmail,
        }).select(
          "+passwordHash"
        );

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password.",
          });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.passwordHash
        );

      if (
        !passwordMatches
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password.",
          });
      }

      const token =
        createToken(
          user._id.toString()
        );

      res
        .status(200)
        .json({
          success: true,

          message:
            "Login successful.",

          token,

          user: {
            id:
              user._id,

            name:
              user.name,

            email:
              user.email,
          },
        });
    } catch (error) {
      console.error(
        "Unable to login:",
        error.message
      );

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to login.",
        });
    }
  }
);

// ======================================
// GET CURRENT USER
// GET /api/auth/me
// PROTECTED
// ======================================

app.get(
  "/api/auth/me",

  protect,

  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User account not found.",
          });
      }

      res
        .status(200)
        .json({
          success: true,

          message:
            "User retrieved successfully.",

          user: {
            id:
              user._id,

            name:
              user.name,

            email:
              user.email,

            createdAt:
              user.createdAt,
          },
        });
    } catch (error) {
      console.error(
        "Unable to retrieve user:",
        error.message
      );

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to retrieve user account.",
        });
    }
  }
);

// ======================================
// UPDATE CURRENT USER PROFILE
// PUT /api/auth/profile
// PROTECTED
// ======================================

app.put(
  "/api/auth/profile",

  protect,

  async (req, res) => {
    try {
      const {
        name,
      } = req.body;

      if (
        typeof name !==
        "string"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name is required.",
          });
      }

      const cleanName =
        name.trim();

      if (
        cleanName.length < 2
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name must contain at least 2 characters.",
          });
      }

      if (
        cleanName.length > 60
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name cannot contain more than 60 characters.",
          });
      }

      const updatedUser =
        await User.findByIdAndUpdate(
          req.userId,

          {
            $set: {
              name:
                cleanName,
            },
          },

          {
            new: true,

            runValidators:
              true,
          }
        );

      if (!updatedUser) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User account not found.",
          });
      }

      res
        .status(200)
        .json({
          success: true,

          message:
            "Profile updated successfully.",

          user: {
            id:
              updatedUser._id,

            name:
              updatedUser.name,

            email:
              updatedUser.email,

            createdAt:
              updatedUser.createdAt,
          },
        });
    } catch (error) {
      console.error(
        "Unable to update profile:",
        error.message
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid profile information.",

            error:
              error.message,
          });
      }

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to update profile.",
        });
    }
  }
);

// ======================================
// CHANGE CURRENT USER PASSWORD
// PUT /api/auth/change-password
// PROTECTED
// ======================================

app.put(
  "/api/auth/change-password",

  protect,

  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        typeof currentPassword !==
          "string" ||
        typeof newPassword !==
          "string" ||
        !currentPassword ||
        !newPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password and new password are required.",
          });
      }

      if (
        newPassword.length < 8
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must contain at least 8 characters.",
          });
      }

      const user =
        await User.findById(
          req.userId
        ).select(
          "+passwordHash"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User account not found.",
          });
      }

      const currentPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

      if (
        !currentPasswordMatches
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Current password is incorrect.",
          });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.passwordHash
        );

      if (
        samePassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must be different from your current password.",
          });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.passwordHash =
        newPasswordHash;

      await user.save();

      res
        .status(200)
        .json({
          success: true,

          message:
            "Password changed successfully.",
        });
    } catch (error) {
      console.error(
        "Unable to change password:",
        error.message
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid password information.",
          });
      }

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to change password.",
        });
    }
  }
);

// ======================================
// DELETE CURRENT USER ACCOUNT
// DELETE /api/auth/account
// PROTECTED
// ======================================

app.delete(
  "/api/auth/account",

  protect,

  async (req, res) => {
    try {
      const {
        currentPassword,
      } = req.body;

      if (
        typeof currentPassword !==
          "string" ||
        !currentPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password is required to delete your account.",
          });
      }

      const user =
        await User.findById(
          req.userId
        ).select(
          "+passwordHash"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User account not found.",
          });
      }

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

      if (
        !passwordMatches
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Current password is incorrect.",
          });
      }

      await Promise.all([
        Assessment.deleteMany({
          user:
            req.userId,
        }),

        RoadmapProgress.deleteMany({
          user:
            req.userId,
        }),
      ]);

      await User.deleteOne({
        _id:
          req.userId,
      });

      res
        .status(200)
        .json({
          success: true,

          message:
            "Your SkillPath account and associated data were deleted successfully.",
        });
    } catch (error) {
      console.error(
        "Unable to delete account:",
        error.message
      );

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to delete account.",
        });
    }
  }
);

// ======================================
// CREATE ASSESSMENT
// POST /api/assessments
// PROTECTED
// ======================================

app.post(
  "/api/assessments",

  protect,

  async (req, res) => {
    try {
      const {
        education,
        technicalSkills,
        experience,
        problemSolving,
        careerInterest,
        goal,
        recommendedCareer,
        readinessScore,
      } = req.body;

      const newAssessment =
        await Assessment.create({
          user:
            req.userId,

          education,

          technicalSkills:
            Array.isArray(
              technicalSkills
            )
              ? technicalSkills
              : [],

          experience,

          problemSolving,

          careerInterest,

          goal,

          recommendedCareer:
            recommendedCareer ||
            "",

          readinessScore:
            typeof readinessScore ===
            "number"
              ? readinessScore
              : 0,
        });

      res
        .status(201)
        .json({
          success: true,

          message:
            "Assessment saved successfully",

          assessment:
            newAssessment,
        });
    } catch (error) {
      console.error(
        "Unable to save assessment:",
        error.message
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please provide all required assessment information.",

            error:
              error.message,
          });
      }

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save assessment.",
        });
    }
  }
);

// ======================================
// GET LATEST USER ASSESSMENT
// GET /api/assessments/latest
// PROTECTED
// ======================================

app.get(
  "/api/assessments/latest",

  protect,

  async (req, res) => {
    try {
      const assessment =
        await Assessment.findOne({
          user:
            req.userId,
        })
          .sort({
            createdAt:
              -1,
          })
          .lean();

      if (!assessment) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "No assessment data found for this user.",
          });
      }

      res
        .status(200)
        .json({
          success: true,

          message:
            "Assessment retrieved successfully",

          assessment,
        });
    } catch (error) {
      console.error(
        "Unable to retrieve assessment:",
        error.message
      );

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to retrieve assessment.",
        });
    }
  }
);

// ======================================
// GET USER ROADMAP PROGRESS
// GET /api/roadmap-progress
// PROTECTED
// ======================================

app.get(
  "/api/roadmap-progress",

  protect,

  async (req, res) => {
    try {
      const roadmapProgress =
        await RoadmapProgress.findOne({
          user:
            req.userId,
        }).lean();

      if (
        !roadmapProgress
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "No roadmap progress found yet.",

            completedItems:
              [],
          });
      }

      res
        .status(200)
        .json({
          success: true,

          message:
            "Roadmap progress retrieved successfully.",

          completedItems:
            Array.isArray(
              roadmapProgress
                .completedItems
            )
              ? roadmapProgress
                  .completedItems
              : [],
        });
    } catch (error) {
      console.error(
        "Unable to retrieve roadmap progress:",
        error.message
      );

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to retrieve roadmap progress.",
        });
    }
  }
);

// ======================================
// SAVE USER ROADMAP PROGRESS
// PUT /api/roadmap-progress
// PROTECTED
// ======================================

app.put(
  "/api/roadmap-progress",

  protect,

  async (req, res) => {
    try {
      const {
        completedItems,
      } = req.body;

      if (
        !Array.isArray(
          completedItems
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "completedItems must be an array.",
          });
      }

      const cleanCompletedItems =
        [
          ...new Set(
            completedItems
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map(
                (item) =>
                  item.trim()
              )
              .filter(
                Boolean
              )
          ),
        ];

      const roadmapProgress =
        await RoadmapProgress
          .findOneAndUpdate(
            {
              user:
                req.userId,
            },

            {
              $set: {
                completedItems:
                  cleanCompletedItems,
              },
            },

            {
              new: true,

              upsert: true,

              runValidators:
                true,
            }
          )
          .lean();

      res
        .status(200)
        .json({
          success: true,

          message:
            "Roadmap progress saved successfully.",

          completedItems:
            roadmapProgress
              .completedItems,
        });
    } catch (error) {
      console.error(
        "Unable to save roadmap progress:",
        error.message
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid roadmap progress data.",
          });
      }

      res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to save roadmap progress.",
        });
    }
  }
);

// ======================================
// 404 API HANDLER
// ======================================

app.use(
  "/api",
  (req, res) => {
    res
      .status(404)
      .json({
        success: false,

        message:
          "API route not found.",
      });
  }
);

// ======================================
// EXPORT EXPRESS APP
// ======================================

module.exports = app;