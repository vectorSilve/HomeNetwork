import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { format } from "date-fns";
import { FileText, Image as ImageIcon, Video, ExternalLink } from "lucide-react";

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'article' | 'image' | 'video';
  url: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to fetch posts:", errorData);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-6 py-4 sm:py-8 lg:py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl leading-[1.1]">
            Designing the future of <span className="text-emerald-600">Intelligence</span>.
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-gray-600 leading-relaxed">
            I'm an AI Engineer and Researcher focused on building scalable machine learning systems and intuitive human-AI interfaces.
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <h2 className="text-xl font-semibold">Latest Work & Insights</h2>
          <div className="text-sm text-gray-500">{posts.length} entries</div>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-black/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-all hover:shadow-xl hover:shadow-black/5"
    >
      {post.type === 'image' && post.url && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {post.type === 'video' && post.url && (
        <div className="aspect-video w-full overflow-hidden bg-black">
          <video
            src={post.url}
            className="h-full w-full object-cover"
            controls
            muted
            loop
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-600">
          {post.type === 'article' && <FileText size={14} />}
          {post.type === 'image' && <ImageIcon size={14} />}
          {post.type === 'video' && <Video size={14} />}
          {post.type}
        </div>

        <h3 className="mb-2 text-xl font-bold leading-tight group-hover:text-emerald-600 transition-colors">
          {post.title}
        </h3>

        <div className="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
          {post.type === 'article' ? (
            <Markdown>{post.content}</Markdown>
          ) : (
            post.content
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-gray-400">
            {format(new Date(post.created_at), 'MMM d, yyyy')}
          </span>
          {post.type === 'article' && (
            <button className="flex items-center gap-1 text-xs font-semibold text-black hover:underline">
              Read More <ExternalLink size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

