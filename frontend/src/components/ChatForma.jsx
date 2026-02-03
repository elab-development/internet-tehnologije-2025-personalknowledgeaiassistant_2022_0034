import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./NavBar";

export default function ChatForma() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you?", sources: [] },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showSources, setShowSources] = useState({});
  const [selectedModel, setSelectedModel] = useState("qwen7");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // New Chat
  const handleNewChat = async () => {
    const title = prompt("Enter a title for your new chat:", "New Chat");

    if (title === null) {
      return null;
    }

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:3000/api/chat",
        { title: title.trim() || "New Chat" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setChats((prev) => [data, ...prev]);
      setCurrentChatId(data.id);
      setMessages([
        { sender: "bot", text: "Hello! How can I help you?", sources: [] },
      ]);
      return data.id;
    } catch (err) {
      console.error("Failed to create new chat:", err);
      alert("Failed to create chat. Please try again.");
      return null;
    }
  };

  // Delete Chat
  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (currentChatId === chatId) {
        const remainingChats = chats.filter((chat) => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
        } else {
          await createInitialChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:3000/api/chat", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chatsArray = Array.isArray(data) ? data : data.chats || [];

      setChats(chatsArray);

      if (chatsArray.length > 0) {
        setCurrentChatId(chatsArray[0].id);
        return chatsArray[0].id;
      } else {
        const newChatId = await createInitialChat();
        return newChatId;
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
      setChats([]);
      const newChatId = await createInitialChat();
      return newChatId;
    }
  };

  // Create initial chat without prompting user (only on first load)
  const createInitialChat = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:3000/api/chat",
        { title: "New Chat" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setChats([data]);
      setCurrentChatId(data.id);
      setMessages([
        { sender: "bot", text: "Hello! How can I help you?", sources: [] },
      ]);
      return data.id;
    } catch (err) {
      console.error("Failed to create initial chat:", err);
      return null;
    }
  };

  // Load chat history for a specific chat
  const loadChatHistory = async (chatId) => {
    if (!chatId) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:3000/api/chat/${chatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Check if data has questions array
      if (data && data.questions && Array.isArray(data.questions)) {
        const formattedMessages = [];

        // Add welcome message at the start
        formattedMessages.push({
          sender: "bot",
          text: "Hello! How can I help you?",
          sources: [],
        });

        // Add each question and answer pair
        data.questions.forEach((q) => {
          // Add user question
          formattedMessages.push({
            sender: "user",
            text: q.query || "",
            sources: [],
          });

          // Add bot answer
          formattedMessages.push({
            sender: "bot",
            text: q.answer || "",
            sources: q.sources || [],
          });
        });

        setMessages(formattedMessages);
      } else {
        setMessages([
          { sender: "bot", text: "Hello! How can I help you?", sources: [] },
        ]);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([
        { sender: "bot", text: "Hello! How can I help you?", sources: [] },
      ]);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:3000/api/document", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadedFiles(
        data.data.map((file) => ({
          id: file.id,
          name: file.fileName,
          type: file.fileType,
        })),
      );
    } catch (err) {
      console.error("Failed to load uploaded files", err);
    }
  };

  // Initial load - only runs once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    axios
      .get("http://localhost:3000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setRole(res.data.data.role);
        console.log("User data:", res.data);
        console.log("User role:", res.data.data.role);
      })
      .catch(() => console.log("Failed to load profile"));
    const loadData = async () => {
      setIsInitializing(true);
      await fetchUploadedFiles();
      await fetchChats();
      setIsInitializing(false);
    };
    loadData();
  }, []);

  // Load chat history whenever currentChatId changes
  useEffect(() => {
    if (currentChatId && !isInitializing) {
      loadChatHistory(currentChatId);
    }
    fetchUploadedFiles();
  }, [currentChatId, uploadedFiles]);

  const HandleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");

      for (const file of files) {
        const allowedExtensions = [".pdf", ".txt", ".md"];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) continue;

        const formData = new FormData();
        formData.append("file", file);

        console.log("Uploading:", file.name);

        const { data } = await axios.post(
          "http://localhost:3000/api/document",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        setUploadedFiles((prev) => [
          ...prev,
          {
            id: data.id,
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: fileExtension,
          },
        ]);
      }
    } catch (error) {
      if (error.response) {
        console.error(
          "File upload failed:",
          error.response.data?.message || error.message,
        );
      } else {
        console.error("File upload failed:", error.message);
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!currentChatId) {
      const newChatId = await createInitialChat();
      if (!newChatId) {
        alert("Failed to create chat. Please try again.");
        return;
      }
      await sendMessage(message, newChatId);
    } else {
      await sendMessage(message, currentChatId);
    }
  };

  const sendMessage = async (userMessage, chatId) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage, sources: [] },
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:3000/api/questions",
        {
          query: userMessage,
          chatId: chatId,
          model: selectedModel,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const botAnswer =
        data?.data?.answer || "Information not found in the documents";
      const botSources = data?.data?.sources || [];

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botAnswer, sources: botSources },
      ]);
    } catch (err) {
      console.error("Failed to send question:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            err.response?.data?.message ||
            "Error connecting to the AI service.",
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:3000/api/document/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const toggleSources = (index) => {
    setShowSources((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-200 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="flex flex-1 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-[20%] min-w-[220px] bg-slate-800 rounded-xl p-4 flex flex-col gap-6 shadow-lg">
          {/* Chat history */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-2 text-sm">
              💬 Chat History
            </h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              <li
                onClick={handleNewChat}
                className="bg-indigo-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-indigo-700 font-medium text-center"
              >
                + New Chat
              </li>
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`bg-slate-700 text-slate-200 px-3 py-2 rounded cursor-pointer hover:bg-slate-600 flex items-center justify-between group ${chat.id === currentChatId
                    ? "ring-2 ring-indigo-500 bg-slate-600"
                    : "opacity-70"
                    }`}
                >
                  <span className="truncate flex-1 text-xs">
                    {chat.title || "Untitled Chat"}
                  </span>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 flex-shrink-0"
                    title="Delete chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Uploaded files */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-2 text-sm">
              📁 Files
            </h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <li
                  key={file.id}
                  className="bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded flex justify-between items-center"
                >
                  <span className="truncate max-w-[70%]">{file.name}</span>

                  <div className="flex items-center gap-1">
                    <span className="opacity-60 text-[10px]">{file.size}</span>

                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="w-5 h-5 bg-red-500 rounded flex items-center justify-center hover:bg-red-600 transition"
                      title="Delete file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="18" y1="6" x2="6" y2="18" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat */}
        <main className="flex-1 bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col">
          <h2 className="text-slate-100 text-lg font-semibold text-center mb-4">
            AI Chat
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 bg-slate-700 rounded-lg p-4">
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${msg.sender === "user"
                      ? "bg-indigo-500 text-white ml-auto"
                      : "bg-slate-600 text-slate-100 mr-auto"
                      }`}
                  >
                    {msg.text}
                  </div>

                  {/* Show Sources button - only for bot messages with sources */}
                  {msg.sender === "bot" &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div className="max-w-[75%] mr-auto">
                        <button
                          type="button"
                          onClick={() => toggleSources(index)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                        >
                          {showSources[index] ? "Hide Sources" : "Show Sources"}
                        </button>

                        {/* Sources display */}
                        {showSources[index] && (
                          <div className="mt-2 bg-slate-800 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-slate-300 mb-2">
                              📚 Sources ({msg.sources.length})
                            </p>
                            {msg.sources.map((source, sourceIndex) => (
                              <div
                                key={sourceIndex}
                                className="bg-slate-700 rounded p-2 text-xs"
                              >
                                <p className="text-indigo-300 font-medium mb-1">
                                  📄 {source.fileName}
                                </p>
                                <p className="text-slate-400 italic">
                                  {source.preview}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}

              {isLoading && (
                <div className="text-slate-300 text-sm italic">
                  AI is typing...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-slate-900 text-slate-100 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex gap-2">
                {/* Upload */}
                <label
                  className={`bg-slate-700 text-slate-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-600 flex items-center justify-center ${isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  title="Upload files"
                >
                  {isUploading ? "⏳" : "📎"}
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    multiple
                    onChange={HandleFileUpload}
                    className="hidden"
                  />
                </label>
                <span
                  className={`flex items-center h-9 text-xs px-2 rounded-full
    ${role === "PREMIUM"
                      ? "bg-slate-700 text-yellow-400"
                      : "bg-slate-700 text-slate-300"}
  `}
                >
                  {role === "PREMIUM" ? "⭐ Premium user" : "👤 Regular user"}
                </span>

                {
                  role === "USER" ? (
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg text-sm outline-none"
                    >
                      <option value="qwen1">Qwen 2.5:1.5b</option>
                      <option value="gemma2">Gemma2</option>
                    </select>)
                    : (
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-slate-900 text-slate-100 px-3 py-2 rounded-lg text-sm outline-none"
                      >
                        <option value="qwen7">Qwen 2.5:7b</option>
                        <option value="llama">LLaMA 3</option>
                        <option value="qwen1">Qwen 2.5:1.5b</option>
                        <option value="gemma2">Gemma2</option>
                      </select>
                    )
                }


                {/* Send */}
                <button
                  type="submit"
                  disabled={isUploading || isLoading}
                  className="flex-1 bg-indigo-500 text-white font-semibold py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
