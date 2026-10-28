// src/context/AuthContext.tsx
import React, { createContext, useContext, useState} from "react";

interface AuthContextType {
  activeUserId: string | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  activeUserId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUserId, setActiveUserId] = useState<string | null>(
    localStorage.getItem("activeUserId")
  );

  const login = (userId: string) => {
    localStorage.setItem("activeUserId", userId);
    setActiveUserId(userId);
  };

  const logout = () => {
    localStorage.removeItem("activeUserId");
    setActiveUserId(null);
  };

  return (
    <AuthContext.Provider value={{ activeUserId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);