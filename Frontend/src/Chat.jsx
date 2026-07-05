import "./Chat.css";
import { MyContext } from "./MyContext.jsx";
import { useContext } from "react";
import { ScaleLoader } from "react-spinners";

function Chat({ isLoading }) {
  const { newChat, prevChats } = useContext(MyContext);

  return (
    <>
      {newChat && <h1>How can I help you today?</h1>}

      <div className="chat-container">
        {prevChats?.map((chat, idx) => (
          <div
            key={idx}
            className={chat.role === "user" ? "user-box" : "assistant-box"}
          >
            {chat.role === "user" ? (
              <p className="user-msg">{chat.content}</p>
            ) : (
              <p className="assistant-msg">{chat.content}</p>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="assistant-box">
            <ScaleLoader color="#fff" height={12} width={3} margin={2} />
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
