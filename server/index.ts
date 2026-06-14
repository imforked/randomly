import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/index.ts";
import { roomsRouter } from "./routes/rooms.ts";

const app = express();
const PORT = 3000;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://www.randomlyapp.com",
]);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://www.randomlyapp.com"],
  })
);

app.use(express.json());

app.use(roomsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});
