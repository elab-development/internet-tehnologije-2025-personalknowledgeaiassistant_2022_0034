import ChatForma from './components/ChatForma'
import LoginForma from './components/LoginForma'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react"

function App() {
  const [isRegistering, setIsRegistering] = useState(false) // State za prebacivanje između login i register

  return (
      <Routes>

        <Route path="/" element={
          <LoginForma isRegistering={isRegistering} setIsRegistering={setIsRegistering} />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatForma />
            </ProtectedRoute>
          }
        />
      </Routes>
  )
}

export default App
