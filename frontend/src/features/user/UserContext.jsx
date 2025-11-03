import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    if (token) setIsAuthenticated(true);
    else setIsAuthenticated(false);
  }, [token]);

  const saveUserSession = (user, token) => {
    console.log("Saving user session:", { user });
    const userRole = user?.role || "user";
    localStorage.setItem("token", token);
    localStorage.setItem("role", userRole);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    setToken(token);
    setRole(userRole);
    setIsAuthenticated(true);
    setShowWelcomeMessage(!user?.verified);
  };
  const login = (data) => {
    const user = data.data?.user || data.user || null;
    const userToken = data.token;
    saveUserSession(user, userToken);
  };

  const signup = (data) => {
    const user = data.data.user;
    const userToken = data.token;
    saveUserSession(user, userToken);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    setShowWelcomeMessage(false);
  };

  const hideWelcomeMessage = () => setShowWelcomeMessage(false);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        token,
        role,
        isAuthenticated,
        showWelcomeMessage,
        login,
        signup,
        updateUser,
        logout,
        hideWelcomeMessage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };
