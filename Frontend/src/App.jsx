import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(uuid());

  const providerValues = {
    prompt, setPrompt,
    response, setResponse,
    currentThreadId, setCurrentThreadId,
  };

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App
