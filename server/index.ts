import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("<h1>Howdy! 🤠</h1>");
});

app.listen(PORT, () => {
  console.log(`The server has started on port ${PORT} 🤠`);
});
