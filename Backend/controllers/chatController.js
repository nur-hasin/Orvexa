import Thread from "../models/Thread.js";
import getOpenRouterAIAPIResponse from "../services/aiService.js";
import { randomUUID } from "crypto";
import { AI_CONFIG } from "../config/aiConfig.js";
import updateSummary from "../services/summaryService.js";
import generateTitle from "../services/titleService.js";

// get all threads
export const getThreads = async (req, res, next) => {
  try {
    const threads = await Thread.find(
      {},
      {
        _id: 0,
        threadId: 1,
        title: 1,
        isPinned: 1,
        updatedAt: 1,
      },
    )
      .sort({
        isPinned: -1,
        updatedAt: -1,
      })
      .lean();

    return res.json(threads);
  } catch (err) {
    next(err);
  }
};

// get a specific thread by ID
export const getThread = async (req, res, next) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId }).lean();

    if (!thread) {
      const error = new Error("Thread not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json(thread.messages);
  } catch (err) {
    next(err);
  }
};

// delete a specific thread by ID
export const deleteThread = async (req, res, next) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      const error = new Error("Thread not found");
      error.statusCode = 404;
      return next(error);
    }

    return res.json({ message: "Thread deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// add a message to a specific thread
export const chat = async (req, res, next) => {
  const { threadId, message } = req.body;

  if (!message?.trim()) {
    const error = new Error("Message is required");
    error.statusCode = 400;
    return next(error);
  }

  try {
    let thread = threadId ? await Thread.findOne({ threadId }) : null;

    if (!thread) {
      thread = new Thread({
        threadId: randomUUID(),
      });
    }

    thread.messages.push({
      role: "user",
      content: message,
    });

    const aiResponse = await getOpenRouterAIAPIResponse(thread);

    thread.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    if (thread.title === "New Chat") {
      thread.title = await generateTitle(thread.messages[0].content);
    }

    const shouldUpdateSummary =
      thread.messages.length >= AI_CONFIG.SUMMARY.WINDOW &&
      thread.messages.length % AI_CONFIG.SUMMARY.WINDOW === 0;

    if (shouldUpdateSummary) {
      thread.summary = await updateSummary(thread);
    }

    await thread.save();

    return res.json({
      threadId: thread.threadId,
      title: thread.title,
      reply: aiResponse,
    });
  } catch (err) {
    next(err);
  }
};

// rename thread title
export const renameThread = async (req, res, next) => {
  const { threadId } = req.params;
  const { title } = req.body;

  if (!title?.trim()) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    return next(error);
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length > 100) {
    const error = new Error("Title cannot exceed 100 characters");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      const error = new Error("Thread not found");
      error.statusCode = 404;
      return next(error);
    }

    thread.title = trimmedTitle;

    await thread.save();

    return res.json({
      message: "Thread title updated successfully",
      title: thread.title,
    });
  } catch (err) {
    next(err);
  }
};

// toggle thread pin status
export const togglePinThread = async (req, res, next) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      const error = new Error("Thread not found");
      error.statusCode = 404;
      return next(error);
    }

    thread.isPinned = !thread.isPinned;
    thread.updatedAt = new Date();

    await thread.save();

    return res.json({
      message: thread.isPinned
        ? "Thread pinned successfully"
        : "Thread unpinned successfully",
      isPinned: thread.isPinned,
      updatedAt: thread.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};