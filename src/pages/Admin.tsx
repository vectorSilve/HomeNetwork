import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Lock, LogOut, FileText, Image as ImageIcon, Video, Send, X } from "lucide-react";
import { format } from "date-fns";

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'article' | 'image' | 'video';
  url: string;
  created_at: string;
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const [newPost, setNewPost] = useState<{
    title: string;
    content: string;
    type: 'article' | 'image' | 'video';
    url: string;
  }>({
    title: "",
    content: "",
    type: "article",
    url: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("admin_password");
    if (saved) {
      checkLogin(saved);
    }
  }, []);

  const checkLogin = async (pass: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setPassword(pass);
        localStorage.setItem("admin_password", pass);
        fetchPosts();
      } else {
        setError("Invalid password");
        localStorage.removeItem("admin_password");
      }
    } catch (e) {
      setError("Server error");
    }
  };

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPost, password }),
    });
    if (res.ok) {
      setIsAdding(false);
      setNewPost({ title: "", content: "", type: "article", url: "" });
      fetchPosts();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      fetchPosts();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-sm py-20">
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-2xl shadow-black/5">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-sm text-gray-500">Enter password to manage content</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkLogin(password);
            }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button className="w-full rounded-xl bg-black py-3 font-semibold text-white transition-transform active:scale-95 hover:bg-gray-900">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Manage your portfolio and blog posts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20"
          >
            <Plus size={18} /> New Post
          </button>
          <button
            onClick={() => {
              setIsLoggedIn(false);
              localStorage.removeItem("admin_password");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white text-gray-400 hover:text-red-600"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/5 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4">Content</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {posts.map((post) => (
              <tr key={post.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold">{post.title}</div>
                  <div className="text-xs text-gray-400 truncate max-w-xs">{post.content}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    {post.type === 'article' && <FileText size={14} />}
                    {post.type === 'image' && <ImageIcon size={14} />}
                    {post.type === 'video' && <Video size={14} />}
                    <span className="capitalize">{post.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {format(new Date(post.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Post</h2>
                <button
                  onClick={() => setIsAdding(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPost} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Title</label>
                    <input
                      required
                      className="w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-600"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Type</label>
                    <select
                      className="w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-600"
                      value={newPost.type}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value as any })}
                    >
                      <option value="article">Article (Markdown)</option>
                      <option value="image">Image URL</option>
                      <option value="video">Video URL</option>
                    </select>
                  </div>
                </div>

                {(newPost.type === 'image' || newPost.type === 'video') && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Media URL</label>
                    <input
                      required
                      placeholder="https://..."
                      className="w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-600"
                      value={newPost.url}
                      onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {newPost.type === 'article' ? 'Content (Markdown)' : 'Caption / Description'}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full rounded-xl border border-black/10 bg-gray-50 px-4 py-3 outline-none focus:border-emerald-600"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="rounded-xl px-6 py-3 font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button className="flex items-center gap-2 rounded-xl bg-black px-8 py-3 font-semibold text-white hover:bg-gray-900">
                    <Send size={18} /> Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
