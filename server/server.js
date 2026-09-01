const mongoose =
  require("mongoose");

require("dotenv").config();

const app =
  require("./app");

const PORT =
  process.env.PORT || 5000;

// ======================================
// DATABASE CONNECTION
// ======================================

async function connectDatabase() {
  try {
    if (
      !process.env.MONGODB_URI
    ) {
      throw new Error(
        "MONGODB_URI is missing from the .env file"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        family: 4,

        serverSelectionTimeoutMS:
          15000,
      }
    );

    console.log(
      "MongoDB connected successfully"
    );
  } catch (error) {
    console.error(
      "\nMongoDB connection failed:"
    );

    console.error(
      error.message
    );

    if (
      error?.reason?.servers
    ) {
      console.error(
        "\nIndividual MongoDB server errors:"
      );

      for (
        const [
          address,
          server,
        ] of error.reason
          .servers
      ) {
        console.error(
          `\nServer: ${address}`
        );

        if (
          server.error
        ) {
          console.error(
            server.error
          );
        }
      }
    }

    process.exit(1);
  }
}

// ======================================
// START SERVER
// ======================================

async function startServer() {
  await connectDatabase();

  app.listen(
    PORT,
    () => {
      console.log(
        `SkillPath server running on http://localhost:${PORT}`
      );
    }
  );
}

startServer();