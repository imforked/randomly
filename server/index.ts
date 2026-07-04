import express from "express";
import cors from "cors";
import { errorHandler, globalRateLimiter } from "./middleware/index.ts";
import { PATH_PREFIX, roomsRouter } from "./routes/rooms.ts";
import { createServer } from "node:http";
import { attachSocketServer } from "./realtime/socketServer.ts";
import { isAllowedOrigin } from "./constants/allowedOrigins.ts";
import helmet from "helmet";
import { deleteAllExpiredRooms } from "./services/rooms.service.ts";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());

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

app.use(express.json({ limit: "32kb" }));

app.use(globalRateLimiter);

app.use(PATH_PREFIX, roomsRouter);

app.use(errorHandler);

const server = createServer(app);

attachSocketServer(server);

server.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});

setInterval(() => {
  void deleteAllExpiredRooms().catch(console.error);
}, 5 * 60 * 1000); // 5 minutes

void deleteAllExpiredRooms().catch(console.error);
