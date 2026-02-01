import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./NavBar";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    axios
      .get("http://localhost:3000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          username: res.data.data.username,
        });
      })
      .catch(() => setError("Failed to load profile"));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:3000/api/user/me",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setIsEditing(false);
    } catch {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.data.firstName,
      lastName: user.data.lastName,
      username: user.data.username,
    });
    setIsEditing(false);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-slate-200">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-slate-100 text-xl font-semibold">
            👤 Profile
          </h2>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-600 transition"
            >
              Edit
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Username"
            name="username"
            value={formData.username}
            isEditing={isEditing}
            onChange={handleChange}
          />
          <ProfileField
            label="Role"
            value={user.data.role}
            disabled
          />
        </div>

        {/* Action buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="bg-slate-600 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Reusable polje */
function ProfileField({
  label,
  name,
  value,
  isEditing,
  onChange,
  disabled = false,
}) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
        {label}
      </p>

      {isEditing && !disabled ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      ) : (
        <p className="text-slate-100 font-semibold text-sm">
          {value}
        </p>
      )}
    </div>
  );
}
