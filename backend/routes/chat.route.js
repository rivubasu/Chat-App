import express from "express";
import {
  accessChat,
  addToGroup,
  createGroupChat,
  fetchChats,
  removeFromGroup,
  renameGroup,
} from "../controllers/chat.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, accessChat);
router.get("/", protectRoute, fetchChats);
router.post("/group", protectRoute, createGroupChat);
router.put("/rename", protectRoute, renameGroup);
router.put("/groupremove", protectRoute, removeFromGroup);
router.put("/groupadd", protectRoute, addToGroup);

export default router;
