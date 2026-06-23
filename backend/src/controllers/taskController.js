const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks  or  /api/projects/:projectId/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignee, search, page = 1, limit = 50, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (req.params.projectId) filter.project = req.params.projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (search) filter.$text = { $search: search };

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .populate('project', 'name color')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({ success: true, data: tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/tasks
exports.createTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const task = await Task.create({
      ...req.body,
      project: req.params.projectId,
      reporter: req.user._id,
    });

    await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'reporter', select: 'name email avatar' },
      { path: 'project', select: 'name color' },
    ]);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color status')
      .populate('comments.user', 'name email avatar');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name color');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    await task.populate('comments.user', 'name email avatar');

    res.status(201).json({ success: true, data: task.comments[task.comments.length - 1] });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id/comments/:commentId
exports.deleteComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete another user\'s comment.' });
    }

    comment.deleteOne();
    await task.save();
    res.json({ success: true, message: 'Comment deleted.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/my-tasks
exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id, status: { $ne: 'done' } })
      .populate('project', 'name color')
      .sort({ dueDate: 1, priority: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};
