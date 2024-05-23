// Models
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Thread from "../models/thread.model.js";

export const readAll = async (req, res) => {
  try {
    const comments = await Comment.find();

    const userIds = comments.map((comment) => comment.userId);
    const users = await User.find({ _id: { $in: userIds } }, { password: 0 });
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    const threadIds = comments.map((comment) => comment.threadId);
    const threads = await Thread.find({ _id: { $in: threadIds } });
    const threadMap = threads.reduce((acc, thread) => {
      acc[thread._id] = thread;
      return acc;
    }, {});

    const commentsWithUserAndThread = comments.map((comment) => {
      const commentWithUserAndThread = { ...comment._doc };
      commentWithUserAndThread.user = userMap[comment.userId];
      commentWithUserAndThread.thread = threadMap[comment.threadId];
      return commentWithUserAndThread;
    });

    res.status(200).json(commentsWithUserAndThread);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const readAllByThreadId = async (req, res) => {
  try {
    const comments = await Comment.find({ threadId: req.params.id });

    const userIds = comments.map((comment) => comment.userId);
    const users = await User.find({ _id: { $in: userIds } }, { password: 0 });
    const userMap = users.reduce((acc, user) => {
      acc[user._id] = user;
      return acc;
    }, {});

    const commentsWithUser = comments.map((comment) => {
      const commentWithUser = { ...comment._doc };
      commentWithUser.user = userMap[comment.userId];
      return commentWithUser;
    });

    res.status(200).json(commentsWithUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const readOne = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    const user = await User.findById(comment.userId, { password: 0 });
    const thread = await Thread.findById(comment.threadId);

    const commentWithUserAndThread = {
      ...comment._doc,
      user,
      thread,
    };

    res.status(200).json(commentWithUserAndThread);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  const { content } = req.body;

  const errors = {};

  if (!content) {
    const error = new Error("El contenido es obligatorio");
    errors.content = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const comment = await Comment.create(req.body);

    const user = await User.findById(comment.userId, { password: 0 });
    const thread = await Thread.findById(comment.threadId);

    const commentWithUserAndThread = {
      ...comment._doc,
      user,
      thread,
    };

    res.status(201).json({
      message: "Comentario creado correctamente",
      comment: commentWithUserAndThread,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const { content } = req.body;

  const errors = {};

  if (!content) {
    const error = new Error("El contenido es obligatorio");
    errors.content = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const user = await User.findById(comment.userId, { password: 0 });
    const thread = await Thread.findById(comment.threadId);

    const commentWithUserAndThread = {
      ...comment._doc,
      user,
      thread,
    };

    res.status(200).json({
      message: "Comentario actualizado correctamente",
      comment: commentWithUserAndThread,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Comentario eliminado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const removeMultiple = async (req, res) => {
  const { ids } = req.body;

  try {
    await Comment.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: `${
        ids.length > 1 ? "Comentarios eliminados" : "Comentario eliminado"
      } con éxito`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
