// Vendors
import express from "express";
// Controllers
import {
  create,
  readAll,
  readOne,
  remove,
  removeMultiple,
  update,
} from "../controllers/users.controller.js";
// Middleware
import checkAuth from "../middleware/checkAuth.middleware.js";

const router = express.Router();

router.get("/users", checkAuth, readAll);
router.get("/users/:id", checkAuth, readOne);
router.post("/users", checkAuth, create);
router.put("/users/:id", checkAuth, update);
router.delete("/users/:id", checkAuth, remove);
router.delete("/users", checkAuth, removeMultiple);

export default router;
