import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  CheckCircle2,
  Bookmark,
  Loader2,
  Pin,
  Lock,
  Send,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import communityService from "../../../services/community.service";
import { formatDate } from "../../../utils/helpers";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => communityService.getById(id).then((r) => r.data.data.post),
  });

  const voteMutation = useMutation({
    mutationFn: (dir) => communityService.vote(id, dir),
    onSuccess: () => queryClient.invalidateQueries(["post", id]),
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => communityService.bookmark(id),
    onSuccess: (res) => toast.success(res.data.data.bookmarked ? "Bookmarked" : "Removed bookmark"),
  });

  const commentMutation = useMutation({
    mutationFn: (data) => communityService.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", id]);
      setCommentText("");
      toast.success("Comment added");
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  if (!post) return null;

  const currentUserId = localStorage.getItem("userId");

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <button onClick={() => navigate("/community")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to Community
      </button>

      <div className="card">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => voteMutation.mutate("up")} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface">
              <ThumbsUp className="w-5 h-5 text-gray-400 hover:text-primary-500" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
            </span>
            <button onClick={() => voteMutation.mutate("down")} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface">
              <ThumbsDown className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {post.isPinned && <Pin className="w-4 h-4 text-red-500" />}
              {post.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
              <span className="text-xs text-gray-500 capitalize">{post.type}</span>
              {post.type === "question" && post.acceptedAnswer && (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Answered</span>
              )}
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h1>
            <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</div>

            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span>by {post.author?.firstName} {post.author?.lastName}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments?.length || 0}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
              <span>{formatDate(post.createdAt)}</span>
              <button onClick={() => bookmarkMutation.mutate()} className="hover:text-primary-500 ml-auto">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {post.comments?.length || 0} {post.comments?.length === 1 ? "Answer" : "Answers"}
        </h2>

        {post.comments?.map((comment) => (
          <CommentItem key={comment._id} comment={comment} postId={post._id} postAuthor={post.author?._id} />
        ))}
      </div>

      {/* Add Comment */}
      {!post.isLocked && (
        <div className="card">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Your Answer</h3>
          <textarea
            className="input min-h-[100px]"
            placeholder="Write your answer..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => commentMutation.mutate({ content: commentText })}
              disabled={!commentText.trim() || commentMutation.isPending}
              className="btn-primary"
            >
              {commentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" /> Post Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, postId, postAuthor }) {
  const queryClient = useQueryClient();
  const currentUserId = localStorage.getItem("userId");
  const isAccepted = comment._id === postId;

  const voteMutation = useMutation({
    mutationFn: (dir) => communityService.voteComment(postId, comment._id, dir),
    onSuccess: () => queryClient.invalidateQueries(["post", postId]),
  });

  const acceptMutation = useMutation({
    mutationFn: () => communityService.acceptAnswer(postId, comment._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", postId]);
      toast.success("Answer accepted");
    },
  });

  return (
    <div className={`card ${isAccepted ? "border-green-500 dark:border-green-700" : ""}`}>
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button onClick={() => voteMutation.mutate("up")} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface">
            <ThumbsUp className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
          </span>
          <button onClick={() => voteMutation.mutate("down")} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface">
            <ThumbsDown className="w-4 h-4 text-gray-400" />
          </button>
          {postAuthor === currentUserId && !isAccepted && (
            <button onClick={() => acceptMutation.mutate()} className="p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 mt-1" title="Accept answer">
              <CheckCircle2 className="w-4 h-4 text-gray-400 hover:text-green-500" />
            </button>
          )}
          {isAccepted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{comment.author?.firstName} {comment.author?.lastName}</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
