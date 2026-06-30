import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/index.ts";
import { PATH_PREFIX, roomsRouter } from "./routes/rooms.ts";
import { createServer } from "node:http";
import { attachSocketServer } from "./realtime/socketServer.ts";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) ?? [];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
  })
);

app.use(express.json());

app.use(PATH_PREFIX, roomsRouter);

app.use(errorHandler);

const server = createServer(app);

attachSocketServer(server);

server.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});
