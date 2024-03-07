import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Server listening on http://localhost:${process.env.APP_PORT}`);
});

