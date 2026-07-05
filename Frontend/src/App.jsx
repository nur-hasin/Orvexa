import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);

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
  };

  return (
      <BrowserRouter>
        <MyContext.Provider value={providerValues}>
          <div className="app">
            <Sidebar />

            <Routes>
              <Route path="/" element={<ChatWindow />} />
              <Route path="/chat/:threadId" element={<ChatWindow />} />
            </Routes>
          </div>
        </MyContext.Provider>
      </BrowserRouter>
  );
}

export default App
