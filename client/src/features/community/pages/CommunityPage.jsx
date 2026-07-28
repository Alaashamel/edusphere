import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Tag,
  Search,
  Loader2,
  X,
  Bookmark,
  CheckCircle2,
  Pin,
  Lock,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import communityService from "../../../services/community.service";
import { formatDate } from "../../../utils/helpers";

const typeConfig = {
  discussion: { icon: MessageCircle, label: "Discussion", color: "#3b82f6" },
  question: { icon: HelpCircle, label: "Question", color: "#f59e0b" },
  announcement: { icon: Pin, label: "Announcement", color: "#ef4444" },
};

export default function CommunityPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("new");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", typeFilter, tagFilter, sortBy],
    queryFn: () =>
      communityService
        .getPosts({ type: typeFilter || undefined, tag: tagFilter || undefined, sort: sortBy })
        .then((r) => r.data.data),
  });

  const { data: trendingTags } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: () => communityService.getTrendingTags().then((r) => r.data.data.tags),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions, share knowledge</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="card p-3">
            <div className="flex flex-wrap gap-2">
              <select className="input text-sm w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
                <option value="announcement">Announcement</option>
              </select>
              <select className="input text-sm w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="new">Newest</option>
                <option value="top">Top</option>
                <option value="trending">Trending</option>
              </select>
              {tagFilter && (
                <button onClick={() => setTagFilter("")} className="badge-primary gap-1">
                  <Tag className="w-3 h-3" /> {tagFilter} <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : data?.posts?.length === 0 ? (
            <div className="card text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Be the first to start a discussion</p>
            </div>
          ) : (
            data?.posts?.map((post) => (
              <Link
                key={post._id}
                to={`/community/${post._id}`}
                className="card hover:shadow-md transition-all block"
              >
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 text-center shrink-0">
                    <ThumbsUp className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                      {post.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: typeConfig[post.type]?.color + "20", color: typeConfig[post.type]?.color }}
                      >
                        {typeConfig[post.type]?.label}
                      </span>
                      {post.type === "question" && post.acceptedAnswer && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Answered
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{post.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>{post.author?.firstName} {post.author?.lastName}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments?.length || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="badge bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 text-xs cursor-pointer hover:bg-primary-50" onClick={(e) => { e.preventDefault(); setTagFilter(tag); }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {trendingTags?.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setTagFilter(t._id)}
                    className="badge bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:bg-primary-50 text-xs"
                  >
                    {t._id} ({t.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreatePostModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "discussion",
    tags: "",
  });

  const mutation = useMutation({
    mutationFn: (data) => communityService.create({ ...data, tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      toast.success("Post created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">New Post</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="discussion">Discussion</option>
              <option value="question">Question</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
            <textarea className="input min-h-[120px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
            <input type="text" className="input" placeholder="react, javascript, hooks" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
