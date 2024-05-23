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
} from "../controllers/categories.controller.js";
// Middleware
import checkAuth from "../middleware/checkAuth.middleware.js";

const router = express.Router();

router.get("/categories", checkAuth, readAll);
router.get("/categories/:id", checkAuth, readOne);
router.post("/categories", checkAuth, create);
router.put("/categories/:id", checkAuth, update);
router.delete("/categories/:id", checkAuth, remove);
router.delete("/categories", checkAuth, removeMultiple);

export default router;
