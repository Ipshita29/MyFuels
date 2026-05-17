import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mf_user"));
    } catch {
      return null;
    }
  });

  const saveAuth = (token, userData) => {
    localStorage.setItem("mf_token", token);
    localStorage.setItem("mf_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("mf_token");
    localStorage.removeItem("mf_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);