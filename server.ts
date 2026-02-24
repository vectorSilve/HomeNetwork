import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("blog.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL, -- 'article', 'image', 'video'
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO posts (title, content, type, url) VALUES (?, ?, ?, ?)");
  insert.run(
    "The Future of Generative AI in 2026",
    "Generative AI has evolved beyond simple text generation. We are now seeing multi-modal systems that can reason across video, audio, and complex codebases in real-time. This article explores the shift towards agentic workflows...",
    "article",
    ""
  );
  insert.run(
    "Neural Network Visualization",
    "A high-resolution visualization of a transformer architecture's attention heads during a translation task.",
    "image",
    "https://picsum.photos/seed/ai1/1200/800"
  );
  insert.run(
    "Autonomous Agent Demo",
    "A short clip showing an AI agent navigating a complex software environment to solve a bug autonomously.",
    "video",
    "https://www.w3schools.com/html/mov_bbb.mp4"
  );
}

const app = express();
app.use(express.json());

const PORT = 3000;

// API Routes
app.get("/api/posts", (req, res) => {
  const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  const { title, content, type, url, password } = req.body;
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const stmt = db.prepare("INSERT INTO posts (title, content, type, url) VALUES (?, ?, ?, ?)");
  const info = stmt.run(title, content, type, url);
  res.json({ id: info.lastInsertRowid });
});

app.delete("/api/posts/:id", (req, res) => {
  const { password } = req.body;
  const { id } = req.params;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
