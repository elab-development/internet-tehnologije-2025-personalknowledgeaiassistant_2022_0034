import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const navigate = useNavigate();

  // Logout funkcija
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Provera uloge korisnika iz tokena
  let role = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role; // očekuje se "admin" ili "user"
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  return (
    <nav className="bg-slate-800 text-slate-100 px-6 py-3 flex justify-between items-center shadow-md">
      <div className="font-bold text-lg tracking-wide">AI Assistant</div>

      <div className="flex gap-4 items-center">
        {role === "ADMIN" && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg font-semibold transition ${
                isActive
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-slate-700 text-slate-200"
              }`
            }
          >
            Users
          </NavLink>
        )}
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg font-semibold transition ${
              isActive
                ? "bg-indigo-500 text-white"
                : "hover:bg-slate-700 text-slate-200"
            }`
          }
        >
          Chat
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-lg font-semibold transition ${
              isActive
                ? "bg-indigo-500 text-white"
                : "hover:bg-slate-700 text-slate-200"
            }`
          }
        >
          Profile
        </NavLink>

        <button
          onClick={handleLogout}
          className="bg-rose-500 px-4 py-1.5 rounded-lg hover:bg-rose-600 text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
