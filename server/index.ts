import express from "express";
import { validateBody } from "./utils.ts";

const app = express();
const PORT = 3000;

app.post("/api/rooms", (req, res) => {
  if (!validateBody(req.body)) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
});

app.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});
