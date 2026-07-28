import Post from "../models/Post.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class CommunityService {
  async createPost(data, userId) {
    return Post.create({ ...data, author: userId });
  }

  async getPosts({ type, tag, search, sort = "new", page = 1, limit = 20 }) {
    const query = {};
    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const sortOption =
      sort === "trending"
        ? { views: -1, createdAt: -1 }
        : sort === "top"
        ? { createdAt: -1 }
        : { isPinned: -1, createdAt: -1 };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "firstName lastName avatar")
      .populate("course", "title code")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const sorted =
      sort === "top"
        ? posts.sort(
            (a, b) =>
              b.upvotes.length -
              b.downvotes.length -
              (a.upvotes.length - a.downvotes.length)
          )
        : posts;

    return { posts: sorted, total, page: parseInt(page), pages: Math.ceil(total / limit) };
  }

  async getPostById(postId) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "firstName lastName avatar")
      .populate("course", "title code")
      .populate("comments.author", "firstName lastName avatar")
      .populate("comments.replies.author", "firstName lastName avatar");
    if (!post) throw new AppError("Post not found", 404);
    return post;
  }

  async updatePost(postId, data, userId) {
    const post = await Post.findOne({ _id: postId, author: userId });
    if (!post) throw new AppError("Post not found or unauthorized", 404);
    Object.assign(post, data);
    await post.save();
    return post;
  }

  async deletePost(postId, userId) {
    const post = await Post.findOneAndDelete({ _id: postId, author: userId });
    if (!post) throw new AppError("Post not found or unauthorized", 404);
    return true;
  }

  async votePost(postId, userId, direction) {
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    const remove = direction === "up" ? "downvotes" : "upvotes";
    const add = direction === "up" ? "upvotes" : "downvotes";

    post[remove] = post[remove].filter((id) => id.toString() !== userId);
    const alreadyVoted = post[add].some((id) => id.toString() === userId);
    if (alreadyVoted) {
      post[add] = post[add].filter((id) => id.toString() !== userId);
    } else {
      post[add].push(userId);
    }

    await post.save();
    return { voteCount: post.upvotes.length - post.downvotes.length };
  }

  async addComment(postId, data, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);
    if (post.isLocked) throw new AppError("Post is locked", 403);

    post.comments.push({ ...data, author: userId });
    await post.save();

    const newComment = post.comments[post.comments.length - 1];
    await Post.populate(newComment, { path: "author", model: "User", select: "firstName lastName avatar" });
    return newComment;
  }

  async voteComment(postId, commentId, userId, direction) {
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    const comment = post.comments.id(commentId);
    if (!comment) throw new AppError("Comment not found", 404);

    const remove = direction === "up" ? "downvotes" : "upvotes";
    const add = direction === "up" ? "upvotes" : "downvotes";

    comment[remove] = comment[remove].filter((id) => id.toString() !== userId);
    const alreadyVoted = comment[add].some((id) => id.toString() === userId);
    if (alreadyVoted) {
      comment[add] = comment[add].filter((id) => id.toString() !== userId);
    } else {
      comment[add].push(userId);
    }

    await post.save();
    return { voteCount: comment.upvotes.length - comment.downvotes.length };
  }

  async acceptAnswer(postId, commentId, userId) {
    const post = await Post.findOne({ _id: postId, type: "question" });
    if (!post) throw new AppError("Question not found", 404);
    if (post.author.toString() !== userId) throw new AppError("Only author can accept answer", 403);

    post.acceptedAnswer = commentId;
    await post.save();
    return true;
  }

  async toggleBookmark(postId, userId) {
    const post = await Post.findById(postId);
    if (!post) throw new AppError("Post not found", 404);

    const isBookmarked = post.bookmarks.some((id) => id.toString() === userId);
    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
    } else {
      post.bookmarks.push(userId);
    }
    await post.save();
    return { bookmarked: !isBookmarked };
  }

  async getBookmarks(userId, { page = 1, limit = 20 } = {}) {
    const query = { bookmarks: userId };
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return { posts, total, page: parseInt(page), pages: Math.ceil(total / limit) };
  }

  async getTrendingTags() {
    return Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
  }
}

export default new CommunityService();
