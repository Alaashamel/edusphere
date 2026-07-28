import StudyGroup from "../models/StudyGroup.model.js";
import { AppError } from "../middlewares/errorHandler.js";
import crypto from "crypto";

class StudyGroupService {
  async createGroup(data, userId) {
    const inviteCode = crypto.randomBytes(6).toString("hex");
    const group = await StudyGroup.create({
      ...data,
      creator: userId,
      inviteCode,
      members: [{ user: userId, role: "admin" }],
    });
    return group.populate("members.user", "firstName lastName email avatar");
  }

  async getGroupById(groupId, userId) {
    const group = await StudyGroup.findOne({ _id: groupId, "members.user": userId })
      .populate("members.user", "firstName lastName email avatar")
      .populate("course", "title code color")
      .populate("announcements.createdBy", "firstName lastName");
    if (!group) throw new AppError("Study group not found", 404);
    return group;
  }

  async getUserGroups(userId) {
    return StudyGroup.find({ "members.user": userId, isArchived: false })
      .populate("members.user", "firstName lastName avatar")
      .populate("course", "title code color")
      .sort({ updatedAt: -1 });
  }

  async joinByCode(inviteCode, userId) {
    const group = await StudyGroup.findOne({ inviteCode });
    if (!group) throw new AppError("Invalid invite code", 404);

    const isMember = group.members.some((m) => m.user.toString() === userId);
    if (isMember) return group;

    if (group.members.length >= group.maxMembers) {
      throw new AppError("Group is full", 400);
    }

    group.members.push({ user: userId, role: "member" });
    await group.save();
    return group.populate("members.user", "firstName lastName email avatar");
  }

  async leaveGroup(groupId, userId) {
    const group = await StudyGroup.findById(groupId);
    if (!group) throw new AppError("Study group not found", 404);

    if (group.creator.toString() === userId) {
      throw new AppError("Creator cannot leave group. Transfer ownership or delete.", 400);
    }

    group.members = group.members.filter((m) => m.user.toString() !== userId);
    await group.save();
    return true;
  }

  async removeMember(groupId, memberId, adminId) {
    const group = await StudyGroup.findById(groupId);
    if (!group) throw new AppError("Study group not found", 404);

    const admin = group.members.find((m) => m.user.toString() === adminId);
    if (!admin || admin.role !== "admin") {
      throw new AppError("Only admins can remove members", 403);
    }

    if (memberId === groupId) throw new AppError("Cannot remove creator", 400);

    group.members = group.members.filter((m) => m.user.toString() !== memberId);
    await group.save();
    return true;
  }

  async addAnnouncement(groupId, data, userId) {
    const group = await StudyGroup.findById(groupId);
    if (!group) throw new AppError("Study group not found", 404);

    const member = group.members.find((m) => m.user.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new AppError("Only admins can post announcements", 403);
    }

    group.announcements.push({ ...data, createdBy: userId });
    await group.save();
    return group.announcements[group.announcements.length - 1];
  }

  async updateGroup(groupId, data, userId) {
    const group = await StudyGroup.findById(groupId);
    if (!group) throw new AppError("Study group not found", 404);

    const member = group.members.find((m) => m.user.toString() === userId);
    if (!member || member.role !== "admin") {
      throw new AppError("Only admins can update group", 403);
    }

    const allowed = ["name", "description", "color", "meetingLink", "maxMembers", "isArchived"];
    for (const key of allowed) {
      if (data[key] !== undefined) group[key] = data[key];
    }

    await group.save();
    return group.populate("members.user", "firstName lastName email avatar");
  }

  async deleteGroup(groupId, userId) {
    const group = await StudyGroup.findOneAndDelete({ _id: groupId, creator: userId });
    if (!group) throw new AppError("Only creator can delete group", 403);
    return true;
  }
}

export default new StudyGroupService();
