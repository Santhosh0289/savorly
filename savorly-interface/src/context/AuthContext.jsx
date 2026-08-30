import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const persist = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return persist(data);
  };

  const sendOtp = (email) => api.post("/auth/send-otp", { email });

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return persist(data);
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    return persist(data);
  };

  const loginWithPhone = async (phone, otp) => {
    const { data } = await api.post("/auth/verify-phone-otp", { phone, otp });
    return persist(data);
  };

  const requestPasswordReset = (email) => api.post("/auth/forgot-password", { email });

  const resetPassword = (email, otp, password) => api.post("/auth/reset-password", { email, otp, password });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, sendOtp, register, loginWithGoogle, loginWithPhone, requestPasswordReset, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
