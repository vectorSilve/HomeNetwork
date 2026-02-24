import express from "express";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// On Vercel, /tmp is the only writable directory
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? '/tmp/blog.db' : 'blog.db';
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL,
    url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
const adminCount = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number };

if (adminCount.count === 0) {
  const adminPass = process.env.ADMIN_PASSWORD || "19970830";
  db.prepare("INSERT INTO admins (username, password) VALUES (?, ?)").run("admin", adminPass);
}

if (count.count <= 3) {
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
      content: "这是一个用 AI 快速读懂 GitHub Trending 项目的 App。它可以自动 analysis 热门项目的核心功能和技术栈，并生成简洁的总结。",
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
    const existing = db.prepare("SELECT id FROM posts WHERE title = ?").get(item.title);
    if (!existing) {
      insert.run(item.title, item.content, item.type, item.url);
    }
  }
}

const app = express();
app.use(express.json());

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
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ? AND password = ?").get(username || "admin", password);
  
  if (admin) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

export default app;
