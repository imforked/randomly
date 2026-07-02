import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/index.ts";
import { PATH_PREFIX, roomsRouter } from "./routes/rooms.ts";
import { createServer } from "node:http";
import { attachSocketServer } from "./realtime/socketServer.ts";
import { isAllowedOrigin } from "./constants/allowedOrigins.ts";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
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
