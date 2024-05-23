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
} from "../controllers/threads.controller.js";
// Middleware
import checkAuth from "../middleware/checkAuth.middleware.js";

const router = express.Router();

router.get("/threads", checkAuth, readAll);
router.get("/threads/:id", checkAuth, readOne);
router.post("/threads", checkAuth, create);
router.put("/threads/:id", checkAuth, update);
router.delete("/threads/:id", checkAuth, remove);
router.delete("/threads", checkAuth, removeMultiple);

export default router;
