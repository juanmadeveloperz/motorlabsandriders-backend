// Models
import Category from "../models/category.model.js";
import Thread from "../models/thread.model.js";
import Comment from "../models/comment.model.js";

export const readAll = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const readOne = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    res.status(200).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  const { name, description } = req.body;

  const errors = {};

  if (!name) {
    const error = new Error("El nombre es obligatorio");
    errors.name = error.message;
  }

  if (!description) {
    const error = new Error("La descripción es obligatoria");
    errors.description = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      message: "Categoría creada correctamente",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const { name, description } = req.body;

  const errors = {};

  if (!name) {
    const error = new Error("El nombre es obligatorio");
    errors.name = error.message;
  }

  if (!description) {
    const error = new Error("La descripción es obligatoria");
    errors.description = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Categoría actualizada correctamente",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const threads = await Thread.find({ categoryId: req.params.id });
    const threadIds = threads.map(thread => thread._id);

    await Thread.deleteMany({ categoryId: req.params.id });
    await Comment.deleteMany({ threadId: { $in: threadIds } });

    res.status(200).json({ message: "Categoría, hilos y comentarios asociados eliminados correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const removeMultiple = async (req, res) => {
  const { ids } = req.body;

  try {
    const categories = await Category.deleteMany({ _id: { $in: ids } });

    if (categories.deletedCount === 0) {
      return res.status(404).json({ message: "No se encontraron categorías para eliminar" });
    }

    const threads = await Thread.find({ categoryId: { $in: ids } });
    const threadIds = threads.map(thread => thread._id);

    await Thread.deleteMany({ categoryId: { $in: ids } });
    await Comment.deleteMany({ threadId: { $in: threadIds } });

    res.status(200).json({
      message: `${
        ids.length > 1 ? "Categorías, hilos y comentarios asociados eliminados con éxito" : "Categoría, hilos y comentarios asociados eliminados con éxito"
      }`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};