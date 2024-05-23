// Vendors
import bcrypt from "bcrypt";
import validator from "validator";
// Models
import User from "../models/user.model.js";
// Utils
import generateJWT from "../utils/generateJWT.util.js";

export const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {};
  const message = {};

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

    message.text = "Usuario creado correctamente";
    message.type = "success";

    res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {};
  const message = {};

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
    const findUser = await User.findOne({ email });

    if (!findUser) {
      message.text = "Usuario o password incorrectos";
      message.type = "error";
      return res.status(404).json({ message });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      message.text = "Usuario o password incorrectos";
      message.type = "error";
      return res.status(404).json({ message });
    }

    const token = generateJWT(findUser.id);

    res.cookie("access_token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
      sameSite: "none",
      secure: false,
      httpOnly: false,
    });

    res.status(200).json({
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  console.log("logout")
  try {
    res.clearCookie("access_token", {
      expires: new Date(Date.now() - 1),
      sameSite: "none",
      secure: false,
      httpOnly: false,
    });

    res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const auth = async (req, res) => {
  const { user } = req;
  res.status(200).json(user);
};
