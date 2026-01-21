import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./NavBar";


export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/", { replace: true });
            return;
        }

        axios.get("http://localhost:3000/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => setUser(res.data))
            .catch(() => setError("Failed to load profile"));
    }, [navigate]);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!user) {
        return <div className="text-white">Loading...</div>;
    }

    return (
        <div className="bg-yellow-700 p-6 rounded-lg shadow-lg w-2/3 max-w-full flex flex-col">
            <Navbar />
            <h2 className="text-white text-xl font-semibold">Profile</h2>

            <div className="space-y-3">
                <ProfileField label="First Name" value={user.data.firstName} />
                <ProfileField label="Last Name" value={user.data.lastName} />
                <ProfileField label="Username" value={user.data.username} />
                <ProfileField label="Role" value={user.data.role} />
            </div>
        </div>
    );
}

/* Reusable polje */
function ProfileField({ label, value }) {
    return (
        <div className="bg-yellow-600 p-3 rounded">
            <p className="text-xs text-yellow-100">{label}</p>
            <p className="text-white font-semibold">{value}</p>
        </div>
    );
}
