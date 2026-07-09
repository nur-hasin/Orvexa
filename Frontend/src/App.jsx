import './App.css';
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { MyContext } from './context/MyContext.jsx';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    threadId,
    setThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
  };

  return (
      <BrowserRouter>
        <MyContext.Provider value={providerValues}>
          <div className="app">
            <Sidebar />

            <Routes>
              <Route path="/" element={<ChatWindow />} />
              <Route path="/thread/:threadId" element={<ChatWindow />} />
            </Routes>
          </div>
        </MyContext.Provider>
      </BrowserRouter>
  );
}

export default App
