import assignmentService from "../services/assignment.service.js";

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Assignment created",
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    res.json({
      success: true,
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAssignments = async (req, res, next) => {
  try {
    const result = await assignmentService.getUserAssignments(req.user._id, req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.updateAssignment(
      req.params.id,
      req.body,
      req.user._id
    );
    res.json({
      success: true,
      message: "Assignment updated",
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.id, req.user._id);
    res.json({
      success: true,
      message: "Assignment deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.submitAssignment(
      req.params.id,
      req.body,
      req.user._id
    );
    res.json({
      success: true,
      message: "Assignment submitted",
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const gradeAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.gradeAssignment(
      req.params.id,
      req.body,
      req.user._id
    );
    res.json({
      success: true,
      message: "Assignment graded",
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueAssignments = async (req, res, next) => {
  try {
    const assignments = await assignmentService.getOverdueAssignments(req.user._id);
    res.json({
      success: true,
      data: { assignments },
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingAssignments = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const assignments = await assignmentService.getUpcomingAssignments(req.user._id, days);
    res.json({
      success: true,
      data: { assignments },
    });
  } catch (error) {
    next(error);
  }
};
