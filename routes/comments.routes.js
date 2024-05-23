// Vendors
import express from "express";
// Controllers
import {
  create,
  readAll,
  readAllByThreadId,
  readOne,
  remove,
  removeMultiple,
  update,
} from "../controllers/comments.controller.js";
// Middleware
import checkAuth from "../middleware/checkAuth.middleware.js";

const router = express.Router();

router.get("/comments", checkAuth, readAll);
router.get("/comments/:id", checkAuth, readOne);
router.get("/comments/thread/:id", checkAuth, readAllByThreadId);
router.post("/comments", checkAuth, create);
router.put("/comments/:id", checkAuth, update);
router.delete("/comments/:id", checkAuth, remove);
router.delete("/comments", checkAuth, removeMultiple);

export default router;
