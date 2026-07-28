import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";
import File from "../models/File.model.js";
import FileFolder from "../models/FileFolder.model.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

class FileService {
  async uploadFile(file, userId, folderId = null) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `edusphere/${userId}`,
          resource_type: "auto",
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const fileDoc = await File.create({
      user: userId,
      name: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folderId,
      url: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl: result.resource_type === "image" ? result.secure_url : null,
      versions: [{ versionNumber: 1, url: result.secure_url, publicId: result.public_id, size: file.size }],
    });

    return fileDoc;
  }

  async uploadNewVersion(fileId, file, userId) {
    const existing = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!existing) throw new Error("File not found");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `edusphere/${userId}`,
          resource_type: "auto",
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const newVersion = existing.currentVersion + 1;
    existing.versions.push({
      versionNumber: newVersion,
      url: result.secure_url,
      publicId: result.public_id,
      size: file.size,
    });
    existing.url = result.secure_url;
    existing.publicId = result.public_id;
    existing.size = file.size;
    existing.currentVersion = newVersion;
    await existing.save();

    return existing;
  }

  async getFiles(userId, { folder, search, tags, starred, sort, page = 1, limit = 50 }) {
    const query = { user: userId, isDeleted: false };

    if (folder) query.folder = folder;
    else query.folder = null;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (starred !== undefined) {
      query.isStarred = starred;
    }

    let sortObj = { createdAt: -1 };
    if (sort === "name") sortObj = { name: 1 };
    else if (sort === "size") sortObj = { size: -1 };
    else if (sort === "type") sortObj = { mimeType: 1 };

    const total = await File.countDocuments(query);
    const files = await File.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit);

    return { files, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getSharedWithMe(userId) {
    const files = await File.find({
      "sharedWith.user": userId,
      isDeleted: false,
    }).populate("user", "name email");
    return files;
  }

  async getFileById(fileId, userId) {
    const file = await File.findOne({
      _id: fileId,
      $or: [{ user: userId }, { "sharedWith.user": userId }],
      isDeleted: false,
    }).populate("user", "name email").populate("sharedWith.user", "name email");
    return file;
  }

  async moveFile(fileId, folderId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.folder = folderId || null;
    await file.save();
    return file;
  }

  async renameFile(fileId, name, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.name = name;
    await file.save();
    return file;
  }

  async toggleStar(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.isStarred = !file.isStarred;
    await file.save();
    return file;
  }

  async addTags(fileId, tags, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    const newTags = tags.map((t) => t.toLowerCase().trim());
    file.tags = [...new Set([...file.tags, ...newTags])];
    await file.save();
    return file;
  }

  async removeTag(fileId, tag, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.tags = file.tags.filter((t) => t !== tag.toLowerCase());
    await file.save();
    return file;
  }

  async shareFile(fileId, targetUserId, permission, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");

    const existing = file.sharedWith.find((s) => s.user.toString() === targetUserId);
    if (existing) {
      existing.permission = permission;
    } else {
      file.sharedWith.push({ user: targetUserId, permission });
    }
    await file.save();
    return file;
  }

  async removeShare(fileId, targetUserId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.sharedWith = file.sharedWith.filter((s) => s.user.toString() !== targetUserId);
    await file.save();
    return file;
  }

  async downloadFile(fileId, userId) {
    const file = await this.getFileById(fileId, userId);
    if (!file) throw new Error("File not found");
    file.downloads += 1;
    await file.save();
    return file;
  }

  async softDelete(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: false });
    if (!file) throw new Error("File not found");
    file.isDeleted = true;
    await file.save();
    return file;
  }

  async restoreFile(fileId, userId) {
    const file = await File.findOne({ _id: fileId, user: userId, isDeleted: true });
    if (!file) throw new Error("File not found");
    file.isDeleted = false;
    await file.save();
    return file;
  }

  async getTrash(userId) {
    return File.find({ user: userId, isDeleted: true }).sort({ updatedAt: -1 });
  }

  // Folder methods
  async createFolder(userId, name, parentId = null) {
    return FileFolder.create({ user: userId, name, parent: parentId || null });
  }

  async getFolders(userId, parentId = null) {
    return FileFolder.find({ user: userId, parent: parentId || null }).sort({ name: 1 });
  }

  async renameFolder(folderId, name, userId) {
    const folder = await FileFolder.findOne({ _id: folderId, user: userId });
    if (!folder) throw new Error("Folder not found");
    folder.name = name;
    await folder.save();
    return folder;
  }

  async deleteFolder(folderId, userId) {
    const folder = await FileFolder.findOne({ _id: folderId, user: userId });
    if (!folder) throw new Error("Folder not found");

    const children = await FileFolder.find({ parent: folderId });
    for (const child of children) {
      await this.deleteFolder(child._id, userId);
    }

    await File.updateMany({ folder: folderId }, { folder: null });
    await FileFolder.deleteOne({ _id: folderId });
    return true;
  }

  async getStorageStats(userId) {
    const files = await File.find({ user: userId, isDeleted: false });
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const byType = {};

    for (const f of files) {
      const ext = f.mimeType.split("/")[1] || "other";
      byType[ext] = (byType[ext] || 0) + f.size;
    }

    return {
      totalFiles: files.length,
      totalSize,
      byType,
      storageLimit: 5 * 1024 * 1024 * 1024,
    };
  }
}

export default new FileService();
