import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SiteLayout from "../components/SiteLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <SiteLayout>
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
          <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
            No account?{" "}
            <Link to="/register" style={{ color: "var(--green)" }}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}
