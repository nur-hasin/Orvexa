import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    response,
    setResponse,
    currentThreadId,
    setCurrentThreadId,
  } = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);

  const getResponse = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          threadId: currentThreadId,
        }),
      });
      const data = await res.json();
      setResponse(data.response);
      setPrompt("");
      console.log(data);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="chat-window">
      <div className="navbar">
        <span>Orvexa</span>
        <i className="fa-regular fa-share-from-square" title="Share"></i>
      </div>

      <Chat></Chat>
      
      <ScaleLoader
        color="#fff"
        loading={isLoading}
        cssOverride={{ display: "block", margin: "0 auto 10rem", borderColor: "red" }}
        size={150}
      />

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
