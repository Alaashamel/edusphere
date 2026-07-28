import fileService from "../services/file.service.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    const { folder } = req.body;
    const file = await fileService.uploadFile(req.file, req.user._id, folder);
    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const uploadNewVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }
    const file = await fileService.uploadNewVersion(req.params.id, req.file, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const { folder, search, tags, starred, sort, page, limit } = req.query;
    const parsedTags = tags ? tags.split(",") : undefined;
    const result = await fileService.getFiles(req.user._id, {
      folder,
      search,
      tags: parsedTags,
      starred: starred === "true" ? true : starred === "false" ? false : undefined,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getSharedWithMe = async (req, res, next) => {
  try {
    const files = await fileService.getSharedWithMe(req.user._id);
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

export const getFileById = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.params.id, req.user._id);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const moveFile = async (req, res, next) => {
  try {
    const file = await fileService.moveFile(req.params.id, req.body.folderId, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const renameFile = async (req, res, next) => {
  try {
    const file = await fileService.renameFile(req.params.id, req.body.name, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const toggleStar = async (req, res, next) => {
  try {
    const file = await fileService.toggleStar(req.params.id, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const addTags = async (req, res, next) => {
  try {
    const file = await fileService.addTags(req.params.id, req.body.tags, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const removeTag = async (req, res, next) => {
  try {
    const file = await fileService.removeTag(req.params.id, req.params.tag, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const shareFile = async (req, res, next) => {
  try {
    const file = await fileService.shareFile(req.params.id, req.body.userId, req.body.permission, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const removeShare = async (req, res, next) => {
  try {
    const file = await fileService.removeShare(req.params.id, req.params.userId, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const file = await fileService.downloadFile(req.params.id, req.user._id);
    res.json({ success: true, data: { url: file.url, name: file.name } });
  } catch (error) {
    next(error);
  }
};

export const softDelete = async (req, res, next) => {
  try {
    await fileService.softDelete(req.params.id, req.user._id);
    res.json({ success: true, message: "File moved to trash" });
  } catch (error) {
    next(error);
  }
};

export const restoreFile = async (req, res, next) => {
  try {
    const file = await fileService.restoreFile(req.params.id, req.user._id);
    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

export const getTrash = async (req, res, next) => {
  try {
    const files = await fileService.getTrash(req.user._id);
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

// Folder controllers
export const createFolder = async (req, res, next) => {
  try {
    const folder = await fileService.createFolder(req.user._id, req.body.name, req.body.parentId);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const getFolders = async (req, res, next) => {
  try {
    const folders = await fileService.getFolders(req.user._id, req.query.parentId || null);
    res.json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

export const renameFolder = async (req, res, next) => {
  try {
    const folder = await fileService.renameFolder(req.params.id, req.body.name, req.user._id);
    res.json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    await fileService.deleteFolder(req.params.id, req.user._id);
    res.json({ success: true, message: "Folder deleted" });
  } catch (error) {
    next(error);
  }
};

export const getStorageStats = async (req, res, next) => {
  try {
    const stats = await fileService.getStorageStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
