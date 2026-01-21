import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-yellow-800 text-white px-6 py-3 flex justify-between items-center shadow-md mb-4 rounded-lg">
      <div className="font-bold text-lg">
        AI Assistant
      </div>

      {/* Linkovi */}
      <div className="flex gap-4 items-center">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `px-3 py-1 rounded font-semibold ${
              isActive ? "bg-yellow-600" : "hover:bg-yellow-700"
            }`
          }
        >
          Chat
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `px-3 py-1 rounded font-semibold ${
              isActive ? "bg-yellow-600" : "hover:bg-yellow-700"
            }`
          }
        >
          Profile
        </NavLink>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
