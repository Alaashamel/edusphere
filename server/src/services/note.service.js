import Note from "../models/Note.model.js";
import Folder from "../models/Folder.model.js";
import { AppError } from "../middlewares/errorHandler.js";

class NoteService {
  // Notes
  async createNote(data, userId) {
    const note = await Note.create({
      ...data,
      createdBy: userId,
    });
    return note.populate("course", "title code color");
  }

  async getNoteById(noteId, userId) {
    const note = await Note.findOne({ _id: noteId, createdBy: userId })
      .populate("course", "title code color")
      .populate("folder", "name color");

    if (!note) {
      throw new AppError("Note not found", 404);
    }
    return note;
  }

  async getUserNotes(userId, { folderId, courseId, tag, search, isPinned, isArchived, page = 1, limit = 20 }) {
    const query = { createdBy: userId };

    if (folderId) query.folder = folderId;
    if (courseId) query.course = courseId;
    if (tag) query.tags = tag;
    if (isPinned !== undefined) query.isPinned = isPinned === "true";
    if (isArchived !== undefined) query.isArchived = isArchived === "true";
    else query.isArchived = false;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate("course", "title code color")
        .populate("folder", "name color")
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments(query),
    ]);

    return {
      notes,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateNote(noteId, updateData, userId) {
    const note = await Note.findOne({ _id: noteId, createdBy: userId });
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (updateData.content && note.content !== updateData.content) {
      note.versionHistory.push({
        content: note.content,
        contentJson: note.contentJson,
      });
    }

    const allowedUpdates = ["title", "content", "contentJson", "folder", "course", "tags", "isPinned", "isArchived", "attachments"];
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        note[key] = updateData[key];
      }
    }

    await note.save();
    return note;
  }

  async deleteNote(noteId, userId) {
    const note = await Note.findOneAndDelete({ _id: noteId, createdBy: userId });
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    return true;
  }

  async getNoteVersions(noteId, userId) {
    const note = await Note.findOne({ _id: noteId, createdBy: userId }).select("title versionHistory");
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    return note.versionHistory;
  }

  async getAllTags(userId) {
    const result = await Note.aggregate([
      { $match: { createdBy: userId, isArchived: false } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    return result.map((r) => ({ tag: r._id, count: r.count }));
  }

  // Folders
  async createFolder(data, userId) {
    return Folder.create({ ...data, createdBy: userId });
  }

  async getUserFolders(userId, courseId) {
    const query = { createdBy: userId };
    if (courseId) query.course = courseId;
    return Folder.find(query).sort({ name: 1 });
  }

  async updateFolder(folderId, updateData, userId) {
    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, createdBy: userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }
    return folder;
  }

  async deleteFolder(folderId, userId) {
    const folder = await Folder.findOneAndDelete({ _id: folderId, createdBy: userId });
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }

    await Note.updateMany({ folder: folderId }, { folder: null });
    await Folder.deleteMany({ parent: folderId });

    return true;
  }
}

export default new NoteService();
