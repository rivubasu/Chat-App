import express from "express";
import { allMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.route("/:chatId").get(protectRoute, allMessages);
router.route("/").post(protectRoute, sendMessage);

export default router;
