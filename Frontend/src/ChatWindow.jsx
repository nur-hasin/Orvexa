import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useState } from "react";

function ChatWindow() {
  const [message, setMessage] = useState("");

  return (
    <div className="chat-window">
      <div className="navbar">
        <span>Orvexa</span>
        <i class="fa-regular fa-share-from-square" title="Share"></i>
      </div>

      <Chat></Chat>

      <div className="chat-input">
        <div className="input-box">
          <input
            type="text"
            placeholder="Ask anything"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="button"
            disabled={!message.trim()}
            title={message.trim() ? "Send prompt" : "Prompt is empty"}
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
