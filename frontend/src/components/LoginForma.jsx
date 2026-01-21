import { useState } from "react"
import { useNavigate } from "react-router-dom"


export default function LoginForma(props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({}) // Greške na klijentu
  const [serverError, setServerError] = useState("") // Greške sa servera
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const navigate = useNavigate()

  /* Regex za validan username */
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/ // primer: slova, brojevi, _ , 3-20 karaktera

  /* Validacija forme na klijentskoj strani */
  function validate() {
    const newErrors = {}

    if (!username.trim()) {
      newErrors.username = "Username is required"
    } else if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username must be 3-20 characters and can only contain letters, numbers, and underscores"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (props.isRegistering) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (!firstName.trim()) {
        newErrors.firstName = "First name is required"
      }

      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required"
      }
    }

    return newErrors
  }

  /* Rukovanje slanjem forme */
  async function handleSubmit(e) {
    e.preventDefault()
    setServerError("")

    const validationErrors = validate()
    setErrors(validationErrors)

    /* Ako nema grešaka, šalje se zahtev ka serveru */
    if (Object.keys(validationErrors).length === 0) {
      try {
        const endpoint = props.isRegistering
          ? "http://localhost:3000/api/auth/register"
          : "http://localhost:3000/api/auth/login"

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            props.isRegistering
              ? { username, password, firstName, lastName }
              : { username, password }
          ),
        })

        const data = await res.json()



        if (res.ok && data.success) {
          localStorage.setItem("token", data.data.token)
          
          if(!props.isRegistering) {
            navigate("/chat")
          } else {
            props.setIsRegistering(!props.isRegistering)
          }

          setUsername("")
          setPassword("")
          setConfirmPassword("")
          setFirstName("")
          setLastName("")
          setErrors({})
        } else {
          setServerError(data.message || "An error occurred")
        }
      } catch (err) {
        setServerError("Cannot connect to server")
      }
    }
  }

  return (
    <div className="bg-yellow-700 p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-white text-xl mb-4">
        {props.isRegistering ? "Sign Up" : "Log In"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {props.isRegistering && (
          <>
            {/* First Name */}
            <div className="flex flex-col">
              <label className="text-white mb-1">First Name</label>
              <input
                className={`p-2 rounded outline-none ${errors.firstName ? "border-2 border-red-500 bg-red-50" : ""
                  }`}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <span className="text-red-100 text-sm mt-1">{errors.firstName}</span>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-white mb-1">Last Name</label>
              <input
                className={`p-2 rounded outline-none ${errors.lastName ? "border-2 border-red-500 bg-red-50" : ""
                  }`}
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <span className="text-red-100 text-sm mt-1">{errors.lastName}</span>
              )}
            </div>
          </>
        )}
        {/* Username */}
        <div className="flex flex-col">
          <label className="text-white mb-1">Username</label>
          <input
            className={`p-2 rounded outline-none ${errors.username ? "border-2 border-red-500 bg-red-50" : ""
              }`}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          {errors.username && (
            <span className="text-red-100 text-sm mt-1">{errors.username}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-white mb-1">Password</label>
          <input
            className={`p-2 rounded outline-none ${errors.password ? "border-2 border-red-500 bg-red-50" : ""
              }`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          {errors.password && (
            <span className="text-red-100 text-sm mt-1">{errors.password}</span>
          )}
        </div>

        {props.isRegistering && (
          <>
            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="text-white mb-1">Confirm Password</label>
              <input
                className={`p-2 rounded outline-none ${errors.confirmPassword ? "border-2 border-red-500 bg-red-50" : ""
                  }`}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && (
                <span className="text-red-100 text-sm mt-1">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </>
        )}

        {/* Server error */}
        {serverError && (
          <div className="text-red-100 text-sm mt-1">{serverError}</div>
        )}

        {/* Submit dugme */}
        <button
          type="submit"
          className="bg-white text-yellow-700 font-semibold py-2 rounded hover:bg-gray-100 w-full"
        >
          {props.isRegistering ? "Sign Up" : "Log In"}
        </button>
      </form>

      {/* Prebacivanje Login / Signup */}
      <p className="text-white text-sm mt-3 text-center">
        {props.isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          className="underline font-semibold"
          onClick={() => props.setIsRegistering(!props.isRegistering)}
        >
          {props.isRegistering ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  )
}
