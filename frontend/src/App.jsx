import { useState, useEffect } from "react";
import WsComponent from "./components/WsComponent";
import AuthForm from "./components/AuthForm";

function App() {
  const [user, setUser] = useState(null); // null = guest
  const [showLogin, setShowLogin] = useState(false); // controls login modal

  // check for existing tkoen on load
  useEffect(() => {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.log("Error parsing user from local storage", e);
            localStorage.removeItem("user"); // Clean up bad data
          }
      }
  }, []);

  const handleLoginSuccess = (authResponse) => {
      setUser(authResponse.user);
      // save token/user to localStorage here
      localStorage.setItem("token", authResponse.token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));
      setShowLogin(false);
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
  };

  return (
    <div className="relative">
      {/* global chat always visible */}
      <WsComponent
          currentUser={user}
          onLoginClick={() => setShowLogin(true)}
          onLogoutClick={handleLogout}
      />

      {/* modal login form */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="">
                <button
                    onClick={() => setShowLogin(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>
                <AuthForm onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
      )}
    </div>
  );
}

export default App;