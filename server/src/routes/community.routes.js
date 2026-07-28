import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  votePost,
  addComment,
  voteComment,
  acceptAnswer,
  toggleBookmark,
  getBookmarks,
  getTrendingTags,
} from "../controllers/community.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  commentSchema,
  voteSchema,
  postsQuerySchema,
} from "../validators/community.validator.js";

const router = Router();

router.get("/posts", authenticate, validate(postsQuerySchema), getPosts);
router.get("/posts/trending-tags", authenticate, getTrendingTags);
router.get("/posts/bookmarks", authenticate, getBookmarks);
router.post("/posts", authenticate, validate(createPostSchema), createPost);
router.get("/posts/:id", authenticate, getPostById);
router.patch("/posts/:id", authenticate, validate(updatePostSchema), updatePost);
router.delete("/posts/:id", authenticate, deletePost);
router.post("/posts/:id/vote", authenticate, validate(voteSchema), votePost);
router.post("/posts/:id/bookmark", authenticate, toggleBookmark);
router.post("/posts/:id/comments", authenticate, validate(commentSchema), addComment);
router.post("/posts/:id/comments/:commentId/vote", authenticate, validate(voteSchema), voteComment);
router.post("/posts/:id/comments/:commentId/accept", authenticate, acceptAnswer);

export default router;
