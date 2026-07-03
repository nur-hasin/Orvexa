import express from "express";
import {
  test,
  getThreads,
  getThread,
  deleteThread,
  chat,
  renameThread,
  shareThread,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/test", test);

router.get("/thread", getThreads);

router.get("/thread/:threadId", getThread);

router.delete("/thread/:threadId", deleteThread);

router.post("/chat", chat);

router.patch("/thread/:threadId/title", renameThread);

router.get("/thread/:threadId/share", shareThread);

export default router;
