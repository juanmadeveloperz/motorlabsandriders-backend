// Models
import Thread from "../models/thread.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Comment from "../models/comment.model.js";

export const readAll = async (req, res) => {
  try {
    const threads = await Thread.find();

    const userIds = threads.map((thread) => thread.userId);
    const users = await User.find({ _id: { $in: userIds } }, { password: 0 });
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    const categoryIds = threads.map((thread) => thread.categoryId);
    const categories = await Category.find({ _id: { $in: categoryIds } });
    const categoryMap = categories.reduce((acc, category) => {
      acc[category._id] = category;
      return acc;
    }, {});

    const threadIds = threads.map((thread) => thread._id);
    const comments = await Comment.aggregate([
      { $match: { threadId: { $in: threadIds } } },
      { $group: { _id: "$threadId", count: { $sum: 1 } } },
    ]);
    const commentMap = comments.reduce((acc, comment) => {
      acc[comment._id] = comment.count;
      return acc;
    }, {});

    const threadsWithDetails = threads.map((thread) => {
      const threadWithDetails = { ...thread._doc };
      threadWithDetails.user = userMap[thread.userId];
      threadWithDetails.category = categoryMap[thread.categoryId];
      threadWithDetails.commentCount = commentMap[thread._id] || 0;
      return threadWithDetails;
    });

    res.status(200).json(threadsWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const readOne = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const user = await User.findById(thread.userId, { password: 0 });
    const category = await Category.findById(thread.categoryId);

    const commentCount = await Comment.countDocuments({ threadId: thread._id });

    const threadWithDetails = {
      ...thread._doc,
      user,
      category,
      commentCount,
    };

    res.status(200).json(threadWithDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  const { title, content } = req.body;

  const errors = {};

  if (!title) {
    const error = new Error("El título es obligatorio");
    errors.title = error.message;
  }

  if (!content) {
    const error = new Error("El contenido es obligatorio");
    errors.content = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const thread = await Thread.create(req.body);
    const user = await User.findById(thread.userId, { password: 0 });
    const category = await Category.findById(thread.categoryId);

    const threadWithUserAndCategory = {
      ...thread._doc,
      user,
      category,
      commentCount: 0,
    };

    res.status(201).json({
      message: "Hilo creado correctamente",
      thread: threadWithUserAndCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const { title, content } = req.body;

  const errors = {};

  if (!title) {
    const error = new Error("El título es obligatorio");
    errors.title = error.message;
  }

  if (!content) {
    const error = new Error("El contenido es obligatorio");
    errors.content = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const thread = await Thread.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const user = await User.findById(thread.userId, { password: 0 });
    const category = await Category.findById(thread.categoryId);
    const commentCount = await Comment.countDocuments({ threadId: thread._id });

    const threadWithUserAndCategory = {
      ...thread._doc,
      user,
      category,
      commentCount,
    };

    res.status(200).json({
      message: "Hilo actualizado correctamente",
      thread: threadWithUserAndCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const thread = await Thread.findByIdAndDelete(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: "Hilo no encontrado" });
    }

    await Comment.deleteMany({ threadId: req.params.id });

    res
      .status(200)
      .json({ message: "Hilo y comentarios asociados eliminados con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const removeMultiple = async (req, res) => {
  const { ids } = req.body;

  try {
    await Thread.deleteMany({ _id: { $in: ids } });

    await Comment.deleteMany({ threadId: { $in: ids } });

    res.status(200).json({
      message: `${
        ids.length > 1 ? "Hilos eliminados" : "Hilo eliminado"
      } con éxito`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
