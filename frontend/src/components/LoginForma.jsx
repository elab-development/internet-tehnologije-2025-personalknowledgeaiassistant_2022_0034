import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForma(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({}); // Greške na klijentu
  const [serverError, setServerError] = useState(""); // Greške sa servera
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  /* Regex za validan username */
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // primer: slova, brojevi, _ , 3-20 karaktera

  /* Validacija forme na klijentskoj strani */
  function validate() {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username must be 3-20 characters and can only contain letters, numbers, and underscores";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (props.isRegistering) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }

    return newErrors;
  }

  /* Rukovanje slanjem forme */
  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    /* Ako nema grešaka, šalje se zahtev ka serveru */
    if (Object.keys(validationErrors).length === 0) {
      try {
        const endpoint = props.isRegistering
          ? "http://localhost:3000/api/auth/register"
          : "http://localhost:3000/api/auth/login";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            props.isRegistering
              ? { username, password, firstName, lastName }
              : { username, password },
          ),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          localStorage.setItem("token", data.data.token);

          if (!props.isRegistering) {
            navigate("/chat");
          } else {
            props.setIsRegistering(!props.isRegistering);
          }

          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setFirstName("");
          setLastName("");
          setErrors({});
        } else {
          setServerError(data.message || "An error occurred");
        }
      } catch (err) {
        setServerError("Cannot connect to server");
      }
    }
  }
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-slate-100 text-xl mb-4 text-center font-semibold">
          {props.isRegistering ? "Sign Up" : "Log In"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {props.isRegistering && (
            <>
              {/* First Name */}
              <div className="flex flex-col">
                <label className="text-slate-300 mb-1 text-sm">
                  First Name
                </label>
                <input
                  className={`p-2 rounded-lg outline-none bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 ${
                    errors.firstName
                      ? "ring-2 ring-rose-500 bg-rose-50 text-slate-900"
                      : ""
                  }`}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <span className="text-rose-400 text-xs mt-1">
                    {errors.firstName}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label className="text-slate-300 mb-1 text-sm">Last Name</label>
                <input
                  className={`p-2 rounded-lg outline-none bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 ${
                    errors.lastName
                      ? "ring-2 ring-rose-500 bg-rose-50 text-slate-900"
                      : ""
                  }`}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <span className="text-rose-400 text-xs mt-1">
                    {errors.lastName}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Username */}
          <div className="flex flex-col">
            <label className="text-slate-300 mb-1 text-sm">Username</label>
            <input
              className={`p-2 rounded-lg outline-none bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 ${
                errors.username
                  ? "ring-2 ring-rose-500 bg-rose-50 text-slate-900"
                  : ""
              }`}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            {errors.username && (
              <span className="text-rose-400 text-xs mt-1">
                {errors.username}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-slate-300 mb-1 text-sm">Password</label>
            <input
              className={`p-2 rounded-lg outline-none bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 ${
                errors.password
                  ? "ring-2 ring-rose-500 bg-rose-50 text-slate-900"
                  : ""
              }`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            {errors.password && (
              <span className="text-rose-400 text-xs mt-1">
                {errors.password}
              </span>
            )}
          </div>

          {props.isRegistering && (
            <div className="flex flex-col">
              <label className="text-slate-300 mb-1 text-sm">
                Confirm Password
              </label>
              <input
                className={`p-2 rounded-lg outline-none bg-slate-900 text-slate-100 focus:ring-2 focus:ring-indigo-500 ${
                  errors.confirmPassword
                    ? "ring-2 ring-rose-500 bg-rose-50 text-slate-900"
                    : ""
                }`}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <span className="text-rose-400 text-xs mt-1">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Server error */}
          {serverError && (
            <div className="text-rose-400 text-sm text-center">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="bg-indigo-500 text-white font-semibold py-2 rounded-lg hover:bg-indigo-600 transition w-full"
          >
            {props.isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-slate-300 text-sm mt-4 text-center">
          {props.isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-indigo-400 font-semibold hover:underline"
            onClick={() => props.setIsRegistering(!props.isRegistering)}
          >
            {props.isRegistering ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
