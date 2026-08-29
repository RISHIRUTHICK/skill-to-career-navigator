const mongoose = require("mongoose");

const assessmentSchema =
  new mongoose.Schema(
    {
      // ======================================
      // OWNER
      // ======================================

      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // ======================================
      // ASSESSMENT DATA
      // ======================================

      education: {
        type: String,
        required: true,
        trim: true,
      },

      technicalSkills: {
        type: [String],
        default: [],
      },

      experience: {
        type: String,
        required: true,
        trim: true,
      },

      problemSolving: {
        type: String,
        required: true,
        trim: true,
      },

      careerInterest: {
        type: String,
        required: true,
        trim: true,
      },

      goal: {
        type: String,
        required: true,
        trim: true,
      },

      recommendedCareer: {
        type: String,
        default: "",
        trim: true,
      },

      readinessScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    {
      timestamps: true,
    }
  );

const Assessment =
  mongoose.model(
    "Assessment",
    assessmentSchema
  );

module.exports = Assessment;