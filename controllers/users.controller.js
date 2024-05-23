// Vendors
import bcrypt from "bcrypt";
import validator from "validator";
// Models
import User from "../models/user.model.js";

export const readAll = async (req, res) => {
  try {
    const users = await User.find();

    const usersWithEmptyPasswords = users.map((user) => {
      const userWithoutPassword = { ...user._doc };
      userWithoutPassword.password = "";
      return userWithoutPassword;
    });

    res.status(200).json(usersWithEmptyPasswords);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const readOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  const { email, password } = req.body;

  const errors = {};

  if (!email) {
    const error = new Error("El email es obligatorio");
    errors.email = error.message;
  } else if (!validator.isEmail(email)) {
    const error = new Error("El email no es válido");
    errors.email = error.message;
  }

  if (!password) {
    const error = new Error("El password es obligatorio");
    errors.password = error.message;
  } else if (password.length < 6) {
    const error = new Error("El password debe contener al menos 6 caracteres");
    errors.password = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      message.text = "El email ya está registrado";
      message.type = "error";
      return res.status(400).json({ message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    const userWithEmptyPassword = { ...savedUser._doc };
    userWithEmptyPassword.password = "";

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: userWithEmptyPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  const { name, email, password, role } = req.body;

  const errors = {};

  if (!name) {
    const error = new Error("El nombre es obligatorio");
    errors.name = error.message;
  }

  if (!email) {
    const error = new Error("El email es obligatorio");
    errors.email = error.message;
  } else if (!validator.isEmail(email)) {
    const error = new Error("El email no es válido");
    errors.email = error.message;
  }

  if (password && password.length < 6) {
    const error = new Error("El password debe contener al menos 6 caracteres");
    errors.password = error.message;
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (password && password.trim().length) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    user.name = name;
    user.email = email;
    user.role = role;

    const updatedUser = await user.save();

    const userWithEmptyPassword = { ...updatedUser._doc };
    userWithEmptyPassword.password = "";

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: userWithEmptyPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const removeMultiple = async (req, res) => {
  const { ids } = req.body;

  try {
    await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      message: `${
        ids.length > 1 ? "Usuarios eliminados" : "Usuario eliminado"
      } con éxito`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
