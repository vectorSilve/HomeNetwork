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
if (count.count <= 3) { // If only initial seed exists or empty
  const insert = db.prepare("INSERT INTO posts (title, content, type, url) VALUES (?, ?, ?, ?)");
  
  const aiContent = [
    {
      title: "JadeAI: AI简历优化器",
      content: "50 套模板、拖拽编辑、AI 对话优化、多格式导出，Docker 一键部署。这是一个开源的 AI 简历优化工具，旨在帮助求职者通过 AI 技术提升简历质量。",
      type: "article",
      url: "https://github.com/ruanyf/weekly/issues/9058"
    },
    {
      title: "Horizon: 让 LLM 帮你过滤与总结新闻",
      content: "Horizon 是一个利用大语言模型（LLM）自动过滤和总结新闻的工具。它可以帮助用户从海量信息中提取关键内容，节省阅读时间。",
      type: "article",
      url: "https://github.com/ruanyf/weekly/issues/9055"
    },
    {
      title: "AgentCut: 多 Agent 协作的 AI 视频生产工具",
      content: "一条 Prompt 生成完整视频。AgentCut 利用多个 AI 智能体协作，实现了从脚本编写到视频生成的全自动化流程。",
      type: "video",
      url: "https://github.com/ruanyf/weekly/issues/9050"
    },
    {
      title: "Trending AI: 快速读懂 GitHub Trending 项目",
      content: "这是一个用 AI 快速读懂 GitHub Trending 项目的 App。它可以自动分析热门项目的核心功能和技术栈，并生成简洁的总结。",
      type: "image",
      url: "https://picsum.photos/seed/trendingai/1200/800"
    },
    {
      title: "NeatScribe: 音视频转录工具",
      content: "立即将音频和视频转录为文字。NeatScribe 采用了先进的语音识别技术，支持多种语言和格式，是内容创作者的得力助手。",
      type: "article",
      url: "https://github.com/ruanyf/weekly/issues/9053"
    }
  ];

  for (const item of aiContent) {
    // Check if already exists to avoid duplicates
    const existing = db.prepare("SELECT id FROM posts WHERE title = ?").get(item.title);
    if (!existing) {
      insert.run(item.title, item.content, item.type, item.url);
    }
  }
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
