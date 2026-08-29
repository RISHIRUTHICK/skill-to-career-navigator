const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  try {
    const authorizationHeader =
      req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const token =
      authorizationHeader
        .split(" ")[1]
        ?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token is missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication service is unavailable.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please log in again.",
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token.",
      });
    }

    console.error(
      "Authentication error:",
      error.message
    );

    res.status(401).json({
      success: false,
      message:
        "Authentication failed.",
    });
  }
}

module.exports = protect;