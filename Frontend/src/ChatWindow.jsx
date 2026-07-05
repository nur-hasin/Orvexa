import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    threadId,
    setThreadId,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const { threadId: sharedThreadId } = useParams();

  useEffect(() => {
    if (sharedThreadId) {
      setThreadId(sharedThreadId);
      localStorage.setItem("threadId", sharedThreadId);
    } else {
      const saved = localStorage.getItem("threadId");

      if (saved) {
        setThreadId(saved);
      }
    }
  }, [sharedThreadId]);

  useEffect(() => {
    if (!threadId) return;

    const loadThread = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/thread/${threadId}`);

        const data = await res.json();

        setPrevChats(data);
        setNewChat(false);
      } catch (err) {
        console.error(err);
      }
    };

    loadThread();
  }, [threadId]);

  const getResponse = async () => {
    const userMessage = prompt.trim();

    setNewChat(false);

    setPrevChats((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setPrompt("");

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          threadId,
        }),
      });
      const data = await res.json();
      console.log(data);

      setThreadId(data.threadId);
      localStorage.setItem("threadId", data.threadId);

      setPrevChats((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!threadId) return;

    const url = `${window.location.origin}/chat/${threadId}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("Conversation link copied!");
    } catch {
      alert("Unable to copy link.");
    }
  };

  return (
    <div className="chat-window">
      <div className="navbar">
        <span>Orvexa</span>
        <i
          className="fa-regular fa-share-from-square"
          title="Share"
          onClick={handleShare}
        ></i>
      </div>

      <Chat isLoading={isLoading} />

      <div className="chat-input">
        <div className="input-box">
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && prompt.trim() && getResponse()
            }
          />
          <button
            type="button"
            disabled={!prompt.trim()}
            title={prompt.trim() ? "Send prompt" : "Prompt is empty"}
            onClick={() => {
              getResponse();
            }}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
        <p className="info">
          Orvexa can make mistakes. Please double-check responses.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
