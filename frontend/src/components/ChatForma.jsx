import { useState } from "react";
import axios from "axios"
import Navbar from "./NavBar";

export default function ChatForma() {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! How can I help you?" },
    ]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Upload vise fajlova (PDF, TXT, MD)
    const HandleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        setIsUploading(true)

        try {
            const token = localStorage.getItem("token")

            for (const file of files) {
                const allowedExtensions = [".pdf", ".txt", ".md"];
                const fileExtension = "." + file.name.split(".").pop().toLowerCase();

                if (!allowedExtensions.includes(fileExtension)) continue;

                const formData = new FormData()
                formData.append("file", file)

                console.log("Uploading:", file.name)

                const { data } = await axios.post(
                    "http://localhost:3000/api/document",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        },
                    }
                )

                console.log("Uploaded:", data)
            }
        } catch (error) {
            if (error.response) {
                console.error(
                    "File upload failed:",
                    error.response.data?.message || error.message
                )
            } else {
                console.error("File upload failed:", error.message)
            }
        } finally {
            setIsUploading(false)
            e.target.value = ""; // Reset input fajlova
        }
    }


    // Chat submit (tekst samo)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setMessages((prev) => [
            ...prev,
            { sender: "user", text: message },
        ]);

        setMessage("");
        setIsLoading(true);

        // simulacija AI odgovora
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "This is a sample AI response" },
            ]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-yellow-700 p-6 rounded-lg shadow-lg w-2/3 max-w-full h-3/4 flex flex-col">
            <Navbar />

            <h2 className="text-white text-xl text-center mb-4">
                AI Chat
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Chat poruke */}
                <div className="bg-yellow-600 rounded p-3 flex-1 min-h-0 overflow-y-auto space-y-2">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[80%] p-2 rounded-lg text-sm break-words ${msg.sender === "user"
                                    ? "bg-white text-yellow-700 ml-auto"
                                    : "bg-yellow-800 text-white mr-auto"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="text-white text-sm italic">
                            AI is typing...
                        </div>
                    )}
                </div>

                {/* Input i dugme */}
                <div className="mt-4 space-y-3">
                    <div className="flex flex-col">
                        <label className="text-white mb-1">Your message</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="p-2 rounded outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Upload fajlova */}
                        <label
                            className={`bg-white text-yellow-700 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 flex items-center justify-center ${isUploading ? "opacity-50 pointer-events-none" : ""
                                }`}
                            title="Upload PDF, TXT, MD files"
                        >
                            {isUploading ? "⏳" : "📎"}
                            <input
                                type="file"
                                accept=".pdf,.txt,.md,text/plain,application/pdf,text/markdown"
                                multiple
                                onChange={HandleFileUpload}
                                className="hidden"
                            />
                        </label>

                        {/* Slanje poruke */}
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 bg-white text-yellow-700 font-semibold py-2 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>

    );
}
