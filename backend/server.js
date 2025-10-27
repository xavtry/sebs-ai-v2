require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const chatRouter = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API route
app.use("/api/chat", chatRouter);

// Serve frontend static files in production (optional)
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Seb's AI backend running on http://localhost:${PORT}`);
});

