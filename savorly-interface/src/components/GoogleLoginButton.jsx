import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleLoginButton() {
  const divRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !divRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        try {
          const user = await loginWithGoogle(credential);
          navigate(user.role === "admin" ? "/admin" : "/");
        } catch (err) {
          setError(err.response?.data?.error || "Google sign-in failed. Please try again.");
        }
      },
    });
    const width = Math.min(400, Math.floor(divRef.current.getBoundingClientRect().width));
    window.google.accounts.id.renderButton(divRef.current, {
      theme: "filled_black", size: "large", shape: "pill", width,
    });
  }, [loginWithGoogle, navigate]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <p className="auth-provider-note">Google sign-in will be available once configured.</p>;
  }
  return <><div className="google-login" ref={divRef} />{error && <p className="error-text" role="alert">{error}</p>}</>;
}
