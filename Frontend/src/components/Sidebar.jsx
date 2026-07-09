import "../styles/Sidebar.css";
import { MyContext } from "../context/MyContext";
import logo from "../assets/logo.png";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    setNewChat,
    setPrompt,
    setPrevChats,
    threadId,
    setThreadId,
  } = useContext(MyContext);
  const navigate = useNavigate();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const menuRef = useRef(null);
  const renameInputRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const triggerRectRef = useRef(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }
    triggerRectRef.current = e.currentTarget.getBoundingClientRect();
    setOpenMenuId(id);
  };

  const getAllThreads = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/threads`);

      if (!res.ok) {
        throw new Error("Failed to fetch threads");
      }

      const data = await res.json();

      setAllThreads(
        data.map((thread) => ({
          id: thread.threadId,
          title: thread.title,
          isPinned: thread.isPinned,
          updatedAt: thread.updatedAt,
        })),
      );
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  }, [setAllThreads]);

  useEffect(() => {
    getAllThreads();
  }, [getAllThreads]);

  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerBtnRef.current &&
        !triggerBtnRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    if (!openMenuId) return;
    const scrollContainer = document.querySelector(".history-scroll");
    const close = () => setOpenMenuId(null);
    scrollContainer?.addEventListener("scroll", close);
    return () => scrollContainer?.removeEventListener("scroll", close);
  }, [openMenuId]);

  useLayoutEffect(() => {
    if (!openMenuId || !menuRef.current || !triggerRectRef.current) return;

    const rect = triggerRectRef.current;
    const menuRect = menuRef.current.getBoundingClientRect();
    const sidebarEl = document.querySelector(".sidebar");
    const sidebarRight = sidebarEl
      ? sidebarEl.getBoundingClientRect().right
      : rect.right;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuRect.height + 8;

    const top = openUpward
      ? Math.max(8, rect.top - menuRect.height - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - menuRect.height - 8);

    const left = Math.max(
      8,
      Math.min(rect.left, sidebarRight - menuRect.width - 8),
    );

    menuRef.current.style.top = `${top}px`;
    menuRef.current.style.left = `${left}px`;
    menuRef.current.style.visibility = "visible";
  }, [openMenuId]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const createNewChat = () => {
    setOpenMenuId(null);
    setThreadId(null);
    setNewChat(true);
    setPrompt("");
    setPrevChats([]);

    localStorage.removeItem("threadId");
    navigate("/");
  };

  const changeThread = (newThreadId) => {
    setOpenMenuId(null);
    navigate(`/thread/${newThreadId}`);
  };

  const togglePin = async (e, thread) => {
    e.stopPropagation();
    setOpenMenuId(null);

    const nextPinned = !thread.isPinned;

    setAllThreads((prev) =>
      prev.map((t) =>
        t.id === thread.id ? { ...t, isPinned: nextPinned } : t,
      ),
    );

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/thread/${thread.id}/pin`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned: nextPinned }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update pin");
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      setAllThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id ? { ...t, isPinned: thread.isPinned } : t,
        ),
      );
    }
  };

  const startRename = (e, thread) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setRenamingId(thread.id);
    setRenameValue(thread.title);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const submitRename = async (thread) => {
    const trimmed = renameValue.trim();

    if (!trimmed || trimmed === thread.title) {
      cancelRename();
      return;
    }

    const previousTitle = thread.title;

    setAllThreads((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, title: trimmed } : t)),
    );
    cancelRename();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/thread/${thread.id}/title`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: trimmed }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to rename thread");
      }
    } catch (error) {
      console.error("Error renaming thread:", error);
      setAllThreads((prev) =>
        prev.map((t) =>
          t.id === thread.id ? { ...t, title: previousTitle } : t,
        ),
      );
    }
  };

  const handleDelete = async (e, thread) => {
    e.stopPropagation();
    setOpenMenuId(null);

    const previousThreads = allThreads;

    setAllThreads((prev) => prev.filter((t) => t.id !== thread.id));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${thread.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete thread");
      }

      if (threadId === thread.id) {
        setThreadId(null);
        setNewChat(true);
        setPrompt("");
        setPrevChats([]);
        localStorage.removeItem("threadId");
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      setAllThreads(previousThreads);
    }
  };

  const pinnedThreads = allThreads.filter((t) => t.isPinned);
  const recentThreads = allThreads.filter((t) => !t.isPinned);

  const renderThread = (thread) => (
    <li
      key={thread.id}
      className={`thread-item${thread.id === threadId ? " active" : ""}${openMenuId === thread.id ? " menu-open" : ""}`}
      onClick={() => changeThread(thread.id)}
    >
      {renamingId === thread.id ? (
        <input
          name="rename"
          ref={renameInputRef}
          className="rename-input"
          value={renameValue}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitRename(thread);
            if (e.key === "Escape") cancelRename();
          }}
          onBlur={() => submitRename(thread)}
        />
      ) : (
        <span className="thread-title">{thread.title}</span>
      )}

      <div
        className={`thread-actions${openMenuId === thread.id ? " menu-open" : ""}`}
      >
        <span
          className="more-btn"
          ref={openMenuId === thread.id ? triggerBtnRef : null}
          onClick={(e) => toggleMenu(e, thread.id)}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </span>
        {openMenuId === thread.id &&
          createPortal(
            <div
              className="thread-menu"
              ref={menuRef}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                visibility: "hidden",
              }}
            >
              <button type="button" onClick={(e) => startRename(e, thread)}>
                <span className="material-symbols-outlined">edit</span>
                Rename
              </button>
              <button type="button" onClick={(e) => togglePin(e, thread)}>
                <span className="material-symbols-outlined">
                  {thread.isPinned ? "keep_off" : "keep"}
                </span>
                {thread.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                className="danger"
                onClick={(e) => handleDelete(e, thread)}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete
              </button>
            </div>,
            document.body,
          )}
      </div>
    </li>
  );

  return (
    <section className="sidebar">
      <button
        type="button"
        className="new-chat-btn"
        title="New chat"
        onClick={createNewChat}
      >
        <img src={logo} alt="orvexa logo" />
        <i className="fa-regular fa-pen-to-square"></i>
      </button>

      <div className="history-scroll">
        {pinnedThreads.length > 0 && (
          <>
            <p className="section-label">Pinned</p>
            <ul className="history">{pinnedThreads.map(renderThread)}</ul>
          </>
        )}

        {recentThreads.length > 0 && (
          <>
            <p className="section-label">Recent</p>
            <ul className="history">{recentThreads.map(renderThread)}</ul>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <p>Made with &hearts; by Orvexa</p>
      </div>
    </section>
  );
}

export default Sidebar;
