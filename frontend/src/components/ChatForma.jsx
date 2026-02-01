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
  const [selectedModel, setSelectedModel] = useState("qwen");

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

  // 👇 FIX: ovo je tačno kako treba
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Upload vise fajlova (PDF, TXT, MD)
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
      e.target.value = ""; // Reset input fajlova
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;

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
        { query: userMessage, model: selectedModel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const answerText = data.data.answer;
      const sources = data.data.sources || [];

      // Ako AI kaže da nema info u dokumentima
      const hasNoInfo = answerText
        ?.toLowerCase()
        .includes("information not found");

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: answerText,
          sources: hasNoInfo ? [] : sources,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Error talking to AI",
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Navbar skroz gore */}
      <Navbar />

      {/* Glavni sadržaj */}
      <div className="flex flex-1 gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-[20%] min-w-[220px] bg-slate-800 rounded-xl p-4 flex flex-col gap-6 shadow-lg">
          {/* Chat istorija */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-2 text-sm">
              💬 Chat History
            </h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              <li className="bg-slate-700 text-slate-200 px-3 py-2 rounded cursor-pointer hover:bg-slate-600">
                New chat
              </li>
              <li className="bg-slate-700 text-slate-200 px-3 py-2 rounded opacity-70">
                Previous chat
              </li>
            </ul>
          </div>

          {/* Uploadovani fajlovi */}
          <div>
            <h3 className="text-slate-200 font-semibold mb-2 text-sm">
              {" "}
              📁 Files{" "}
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
                      className="
    w-5 h-5
    bg-red-500
    rounded
    flex items-center justify-center
    hover:bg-red-600
    transition
  "
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
            {/* Poruke */}
            <div className="flex-1 overflow-y-auto space-y-3 bg-slate-700 rounded-lg p-4">
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                      msg.sender === "user"
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
                  className={`bg-slate-700 text-slate-200 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-600 flex items-center justify-center ${
                    isUploading ? "opacity-50 pointer-events-none" : ""
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

                {/* Send */}
                <button
                  type="submit"
                  disabled={isUploading}
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
