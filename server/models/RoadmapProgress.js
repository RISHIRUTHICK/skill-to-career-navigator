const mongoose = require("mongoose");

const roadmapProgressSchema =
  new mongoose.Schema(
    {
      // ======================================
      // USER
      // ======================================

      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
      },

      // ======================================
      // COMPLETED ROADMAP ITEMS
      // ======================================

      completedItems: {
        type: [String],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

const RoadmapProgress =
  mongoose.model(
    "RoadmapProgress",
    roadmapProgressSchema
  );

module.exports =
  RoadmapProgress;