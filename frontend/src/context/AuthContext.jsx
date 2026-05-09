import { createContext, useContext, useState } from "react";
import { r2Service } from "../services/r2Service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(username, password) {
    const data = await r2Service.login(username, password);
    const userData = { username: data.username, role: data.role };
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", data.token);
    return true;
  }

  async function register(username, password) {
    const data = await r2Service.register(username, password);
    const userData = { username: data.username };
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", data.token);
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }

  function loginWithToken(token, username) {
    const userData = { username };
    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
    localStorage.setItem("auth_token", token);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
