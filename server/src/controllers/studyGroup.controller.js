import studyGroupService from "../services/studyGroup.service.js";

export const createGroup = async (req, res, next) => {
  try {
    const group = await studyGroupService.createGroup(req.body, req.user._id);
    res.status(201).json({ success: true, message: "Study group created", data: { group } });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await studyGroupService.getGroupById(req.params.id, req.user._id);
    res.json({ success: true, data: { group } });
  } catch (error) {
    next(error);
  }
};

export const getUserGroups = async (req, res, next) => {
  try {
    const groups = await studyGroupService.getUserGroups(req.user._id);
    res.json({ success: true, data: { groups } });
  } catch (error) {
    next(error);
  }
};

export const joinByCode = async (req, res, next) => {
  try {
    const group = await studyGroupService.joinByCode(req.body.inviteCode, req.user._id);
    res.json({ success: true, message: "Joined group", data: { group } });
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    await studyGroupService.leaveGroup(req.params.id, req.user._id);
    res.json({ success: true, message: "Left group" });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    await studyGroupService.removeMember(req.params.id, req.params.memberId, req.user._id);
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

export const addAnnouncement = async (req, res, next) => {
  try {
    const announcement = await studyGroupService.addAnnouncement(req.params.id, req.body, req.user._id);
    res.status(201).json({ success: true, data: { announcement } });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = await studyGroupService.updateGroup(req.params.id, req.body, req.user._id);
    res.json({ success: true, message: "Group updated", data: { group } });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    await studyGroupService.deleteGroup(req.params.id, req.user._id);
    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    next(error);
  }
};
