import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function AdminUserFilesPage() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:3000/api/document/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res.data);
        setFiles(res.data.data || []);
        setUser({ username: "Unknown" });
      })
      .catch((err) => {
        console.error(err);
        setFiles([]);
      });
  }, [id]);

  const deleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3000/api/document/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete file");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-8 bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          📁 Files – {user?.username}
        </h2>

        {files?.length === 0 ? (
          <p className="text-slate-400">No files uploaded.</p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="bg-slate-700 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-slate-100 font-medium">{file.fileName}</p>
                  <p className="text-xs text-slate-400">{file.fileType}</p>
                </div>

                <button
                  onClick={() => deleteFile(file.id)}
                  className="text-rose-400 hover:text-rose-500 text-sm font-semibold"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
