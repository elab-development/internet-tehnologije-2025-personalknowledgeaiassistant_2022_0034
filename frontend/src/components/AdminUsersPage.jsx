import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:3000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:3000/api/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const saveUser = async () => {
    const token = localStorage.getItem("token");
    if (!selectedUser) return;

    try {
      await axios.put(
        `http://localhost:3000/api/user/${selectedUser.id}`,
        selectedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
      );
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save user");
    }
  };

  if (loading) return <div className="text-slate-200">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-8 bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          🛠️ User Management
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-200">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="py-2">Name</th>
                <th>Username</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id || index}
                  className="border-b border-slate-700 hover:bg-slate-700/40"
                >
                  <td className="py-3">
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.username}</td>
                  <td>
                    <span className="px-2 py-1 rounded bg-slate-700 text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="text-indigo-400 hover:underline"
                    >
                      Files
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditOpen(true);
                      }}
                      className="text-emerald-400 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-rose-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 w-full max-w-md rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-slate-100 font-semibold mb-4">
              ✏️ Edit Profile
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={selectedUser.firstName}
                onChange={(e) =>
                  setSelectedUser((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded bg-slate-700 text-slate-100"
                placeholder="First name"
              />

              <input
                type="text"
                value={selectedUser.lastName}
                onChange={(e) =>
                  setSelectedUser((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded bg-slate-700 text-slate-100"
                placeholder="Last name"
              />

              <input
                type="text"
                value={selectedUser.username}
                onChange={(e) =>
                  setSelectedUser((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded bg-slate-700 text-slate-100"
                placeholder="Username"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded bg-slate-600 text-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={saveUser}
                className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
