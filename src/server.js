import express from "express";
import cors from "cors";
import morgan from "morgan";
import exitHook from "async-exit-hook";

import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import router from "~/routes/v1";
import { errorHandlingMiddleware } from "~/middlewares/errorHandling";

const START_SERVER = async () => {
  const app = express();

  /** middlewares */
  app.use(express.json());
  app.use(cors());
  app.use(morgan("tiny"));
  app.disable("x-powered-by");

  /** error handling */
  app.use(errorHandlingMiddleware);

  /** api routes */
  app.use("/api/v1", router);

  app.listen(env.APP_PORT, () => {
    console.log(
      `Back-end Server is running successfully at Host: http://localhost:${env.APP_PORT}`
    );
  });

  exitHook(() => {
    console.log("Disconnecting from MongoDB Cloud Atlas...");
    CLOSE_DB();
    console.log("Disconnected from MongoDB Cloud Atlas!");
  });
};

console.log("1. Connecting to MongoDB Cloud Atlas...");
CONNECT_DB()
  .then(() => console.log("2. Connected to MongoDB Cloud Atlas!"))
  .then(() => START_SERVER())
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });

