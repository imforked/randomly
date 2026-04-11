import express from "express";
import { errorHandler } from "./middleware/index.ts";
import { roomsRouter } from "./routes/rooms.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(roomsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});
