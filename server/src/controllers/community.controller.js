import communityService from "../services/community.service.js";

export const createPost = async (req, res, next) => {
  try {
    const post = await communityService.createPost(req.body, req.user._id);
    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const result = await communityService.getPosts(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await communityService.getPostById(req.params.id);
    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await communityService.updatePost(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    await communityService.deletePost(req.params.id, req.user._id);
    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

export const votePost = async (req, res, next) => {
  try {
    const result = await communityService.votePost(req.params.id, req.user._id, req.body.direction);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const comment = await communityService.addComment(req.params.id, req.body, req.user._id);
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    next(error);
  }
};

export const voteComment = async (req, res, next) => {
  try {
    const result = await communityService.voteComment(req.params.id, req.params.commentId, req.user._id, req.body.direction);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptAnswer = async (req, res, next) => {
  try {
    await communityService.acceptAnswer(req.params.id, req.params.commentId, req.user._id);
    res.json({ success: true, message: "Answer accepted" });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const result = await communityService.toggleBookmark(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getBookmarks = async (req, res, next) => {
  try {
    const result = await communityService.getBookmarks(req.user._id, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTrendingTags = async (req, res, next) => {
  try {
    const tags = await communityService.getTrendingTags();
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};
