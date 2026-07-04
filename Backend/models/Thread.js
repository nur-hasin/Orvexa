import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ThreadSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    summary: {
      type: String,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  },
);

// Sidebar index
ThreadSchema.index({
  isPinned: -1,
  updatedAt: -1,
});

export default mongoose.model("Thread", ThreadSchema);
