import "../styles/Chat.css";
import { MyContext } from "../context/MyContext.jsx";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useState,
} from "react";

import { ScaleLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

function normalizeMath(text) {
  return text;
}

function AnimatedReply({ content, onTick, onComplete }) {
  const [visibleLength, setVisibleLength] = useState(0);

  const normalized = useMemo(() => normalizeMath(content), [content]);

  useEffect(() => {
    let index = 0;

    const speed = 5;
    const timer = setInterval(() => {
      index += speed;

      setVisibleLength(index);

      onTick?.();

      if (index >= normalized.length) {
        clearInterval(timer);
        setVisibleLength(normalized.length);
        onComplete?.();
      }
    }, 20);

    return () => clearInterval(timer);
  }, [normalized, onTick, onComplete]);

  const displayed = normalized
    .slice(0, visibleLength)
    .replace(/\$\$[\s\S]*$/, "");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
    >
      {displayed}
    </ReactMarkdown>
  );
}

function Chat({
  isLoading,
  animateReply,
  setAnimateReply,
  isThreadSwitch,
  clearThreadSwitch,
  scrollToBottom,
}) {
  const { newChat, prevChats } = useContext(MyContext);
  const bottomRef = useRef(null);
  const lastMessage = prevChats.at(-1);
  const shouldAnimate =
    animateReply && !isThreadSwitch && lastMessage?.role === "assistant";

  useLayoutEffect(() => {
    if (!shouldAnimate) {
      scrollToBottom();
    }

    if (isThreadSwitch) {
      clearThreadSwitch?.();
    }
  }, [
    prevChats,
    shouldAnimate,
    isThreadSwitch,
    clearThreadSwitch,
    scrollToBottom,
  ]);

  const handleTick = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const handleComplete = () => {
    setAnimateReply(false);
  };

  return (
    <>
      {newChat && (
        <div className="empty-state">
          <h1>How can I help you today?</h1>

          <p>
            Start a conversation: learn concepts, explore ideas, or build
            something new.
          </p>
        </div>
      )}

      <div className="chat-container">
        {prevChats.slice(0, -1).map((chat, index) => (
          <div
            key={chat.timestamp || index}
            className={chat.role === "user" ? "user-box" : "assistant-box"}
          >
            {chat.role === "user" ? (
              <p className="user-msg">{chat.content}</p>
            ) : (
              <div className="assistant-msg">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                >
                  {normalizeMath(chat.content)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {lastMessage && (
          <div
            className={
              lastMessage.role === "user"
                ? "user-box"
                : lastMessage.role === "notice"
                  ? "notice-box"
                  : "assistant-box"
            }
          >
            {lastMessage.role === "user" ? (
              <p className="user-msg">{lastMessage.content}</p>
            ) : lastMessage.role === "notice" ? (
              <p className="notice-msg">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {lastMessage.content}
              </p>
            ) : (
              <div className="assistant-msg">
                {shouldAnimate ? (
                  <AnimatedReply
                    key={prevChats.length}
                    content={lastMessage.content}
                    onTick={handleTick}
                    onComplete={handleComplete}
                  />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex, rehypeHighlight]}
                  >
                    {normalizeMath(lastMessage.content)}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="assistant-box">
            <div className="assistant-msg">
              <ScaleLoader color="#fff" height={12} width={3} margin={2} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default Chat;
