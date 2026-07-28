import noteService from "../services/note.service.js";

export const createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNote(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Note created", data: { note } });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user._id);
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

export const getUserNotes = async (req, res, next) => {
  try {
    const result = await noteService.getUserNotes(req.user._id, req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.body, req.user._id);
    res.json({ success: true, message: "Note updated", data: { note } });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await noteService.deleteNote(req.params.id, req.user._id);
    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    next(error);
  }
};

export const getNoteVersions = async (req, res, next) => {
  try {
    const versions = await noteService.getNoteVersions(req.params.id, req.user._id);
    res.json({ success: true, data: { versions } });
  } catch (error) {
    next(error);
  }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await noteService.getAllTags(req.user._id);
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};

// Folders
export const createFolder = async (req, res, next) => {
  try {
    const folder = await noteService.createFolder(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Folder created", data: { folder } });
  } catch (error) {
    next(error);
  }
};

export const getUserFolders = async (req, res, next) => {
  try {
    const folders = await noteService.getUserFolders(req.user._id, req.query.courseId);
    res.json({ success: true, data: { folders } });
  } catch (error) {
    next(error);
  }
};

export const updateFolder = async (req, res, next) => {
  try {
    const folder = await noteService.updateFolder(req.params.id, req.body, req.user._id);
    res.json({ success: true, message: "Folder updated", data: { folder } });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req, res, next) => {
  try {
    await noteService.deleteFolder(req.params.id, req.user._id);
    res.json({ success: true, message: "Folder deleted" });
  } catch (error) {
    next(error);
  }
};
