import express from "express";
import {
  register,
  login,
  logout,
  auth,
} from "../controllers/auth.controller.js";
import checkAuth from "../middleware/checkAuth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", checkAuth, logout);
router.get("/verify", checkAuth, auth);

export default router;
