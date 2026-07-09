import express from "express";
import {
  getThreads,
  getThread,
  deleteThread,
  chat,
  renameThread,
  togglePinThread,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/threads", getThreads);
router.get("/thread/:threadId", getThread);
router.delete("/thread/:threadId", deleteThread);
router.post("/chat", chat);
router.patch("/thread/:threadId/title", renameThread);
router.patch("/thread/:threadId/pin", togglePinThread);

export default router;
