import "../styles/ChatWindow.css";
import Chat from "./Chat";
import { MyContext } from "../context/MyContext";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    threadId,
    setThreadId,
    setPrevChats,
    setNewChat,
    setAllThreads,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingThreadId, setLoadingThreadId] = useState(null);
  const { threadId: sharedThreadId } = useParams();
  const navigate = useNavigate();
  const [animateReply, setAnimateReply] = useState(false);
  const [isFetchingThread, setIsFetchingThread] = useState(false);
  const [fetchedThreadReady, setFetchedThreadReady] = useState(false);
  const [isThreadSwitch, setIsThreadSwitch] = useState(false);
  const chatBodyRef = useRef(null);
  const skipNextLoadRef = useRef(false);
  const currentThreadRef = useRef(threadId);

  useEffect(() => {
    currentThreadRef.current = threadId;
  }, [threadId]);

  const pendingRef = useRef({});
  const effectiveThreadId = threadId || sharedThreadId || null;

  const showLoader = effectiveThreadId
    ? isFetchingThread || !fetchedThreadReady
    : false;

  const showThinking = isLoading && loadingThreadId === effectiveThreadId;

  const scrollToBottom = useCallback(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const clearThreadSwitch = useCallback(() => {
    setIsThreadSwitch(false);
  }, []);

  useEffect(() => {
    if (sharedThreadId) {
      setThreadId(sharedThreadId);
      localStorage.setItem("threadId", sharedThreadId);
    } else {
      setThreadId(null);
      localStorage.removeItem("threadId");
    }
  }, [sharedThreadId, setThreadId, navigate]);

  useEffect(() => {
    if (!threadId) return;

    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }

    const loadThread = async () => {
      setIsFetchingThread(true);
      setIsThreadSwitch(true);
      setAnimateReply(false);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/thread/${threadId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        setFetchedThreadReady(false);

        const pending = pendingRef.current[threadId];
        const lastServerMsg = data[data.length - 1];
        const alreadyOnServer =
          pending &&
          lastServerMsg?.role === "user" &&
          lastServerMsg?.content === pending.content;

        if (pending && !alreadyOnServer) {
          setPrevChats([
            ...data,
            { role: "user", content: pending.content, id: pending.id },
          ]);
        } else {
          setPrevChats(data);
        }

        setNewChat(false);
        setFetchedThreadReady(true);
      } catch (err) {
        console.error(err);
        setFetchedThreadReady(true);
      } finally {
        setIsFetchingThread(false);
      }
    };

    loadThread();
  }, [threadId, setPrevChats, setNewChat]);

  const getResponse = async () => {
    if (isLoading) return;

    const userMessage = prompt.trim();
    const requestThreadId = threadId ?? null;
    const messageId = crypto.randomUUID();

    setNewChat(false);
    setPrevChats((prev) => [
      ...prev,
      { role: "user", content: userMessage, id: messageId },
    ]);

    if (requestThreadId) {
      pendingRef.current[requestThreadId] = {
        id: messageId,
        content: userMessage,
      };
    }

    setPrompt("");
    setIsLoading(true);
    setLoadingThreadId(requestThreadId);
    setAnimateReply(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          threadId: requestThreadId,
        }),
      });
      const data = await res.json();

      const stillOnSameThread = currentThreadRef.current === requestThreadId;

      if (res.status === 429 && data.limitType) {
        if (stillOnSameThread) {
          setPrevChats((prev) => [
            ...prev,
            {
              role: "notice",
              content: data.message,
              id: crypto.randomUUID(),
            },
          ]);
        }
        return;
      }

      if (res.status === 429 && data.rateLimited) {
        if (stillOnSameThread) {
          setPrevChats((prev) => [
            ...prev,
            {
              role: "notice",
              content:
                data.message ||
                "Daily free-tier limit reached. Please try again later.",
              id: crypto.randomUUID(),
            },
          ]);
        }

        if (!requestThreadId && data.threadId) {
          skipNextLoadRef.current = true;
          setThreadId(data.threadId);
          localStorage.setItem("threadId", data.threadId);
          navigate(`/thread/${data.threadId}`, { replace: true });
        }
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (stillOnSameThread) {
        skipNextLoadRef.current = true;
        setThreadId(data.threadId);
        localStorage.setItem("threadId", data.threadId);
        navigate(`/thread/${data.threadId}`, { replace: true });

        setPrevChats((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, id: crypto.randomUUID() },
        ]);
      }

      if (!requestThreadId) {
        setAllThreads((prev) => {
          const exists = prev.some((thread) => thread.id === data.threadId);

          if (exists) {
            return prev.map((thread) =>
              thread.id === data.threadId
                ? {
                    ...thread,
                    title: data.title,
                    updatedAt: new Date().toISOString(),
                  }
                : thread,
            );
          }

          return [
            {
              id: data.threadId,
              title: data.title || userMessage.slice(0, 30),
              isPinned: false,
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      } else {
        setAllThreads((prev) => {
          const updated = prev.map((thread) =>
            thread.id === requestThreadId
              ? { ...thread, updatedAt: new Date().toISOString() }
              : thread,
          );

          const target = updated.find(
            (thread) => thread.id === requestThreadId,
          );
          if (!target) return updated;

          const rest = updated.filter(
            (thread) => thread.id !== requestThreadId,
          );
          return [target, ...rest];
        });
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      if (currentThreadRef.current === requestThreadId) {
        setPrevChats((prev) => [
          ...prev,
          {
            role: "notice",
            content: "Something went wrong. Please try again.",
            id: crypto.randomUUID(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setLoadingThreadId(null);
      if (requestThreadId) {
        delete pendingRef.current[requestThreadId];
      }
    }
  };

  const canShare = Boolean(threadId);

  const handleShare = async () => {
    if (!canShare) return;
    const url = `${window.location.origin}/thread/${threadId}`;
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
        <button
          type="button"
          className="share-btn"
          disabled={!canShare}
          title={canShare ? "Share" : "Start a conversation to share"}
          onClick={handleShare}
        >
          <i className="fa-regular fa-share-from-square"></i>
        </button>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        {showLoader ? (
          <div className="thread-loader">
            <ScaleLoader color="#fff" />
          </div>
        ) : (
          <Chat
            isLoading={showThinking}
            animateReply={animateReply}
            setAnimateReply={setAnimateReply}
            isThreadSwitch={isThreadSwitch}
            clearThreadSwitch={clearThreadSwitch}
            scrollToBottom={scrollToBottom}
          />
        )}
      </div>

      <div className="chat-input">
        <div className="input-box">
          <input
            name="prompt"
            type="text"
            placeholder="Ask anything"
            value={prompt}
            disabled={isLoading}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && prompt.trim() && getResponse()
            }
          />
          <button
            type="button"
            disabled={isLoading || !prompt.trim()}
            title={prompt.trim() ? "Send prompt" : "Prompt is empty"}
            onClick={() => getResponse()}
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
