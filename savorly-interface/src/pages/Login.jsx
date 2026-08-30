import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import PhoneLoginModal from "../components/PhoneLoginModal";
import SiteLayout from "../components/SiteLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch {
      setError("Invalid email or password");
    }
  };

  return <SiteLayout>
    <div className="auth-page"><div className="auth-card">
      <h2>Welcome back</h2>
      <GoogleLoginButton />
      <button className="btn btn-ghost auth-full-button auth-provider-button" type="button" onClick={() => setShowPhone(true)}>Continue with phone</button>
      <div className="auth-divider">or continue with email</div>
      <form onSubmit={handleSubmit}>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn btn-primary auth-full-button">Login</button>
      </form>
      <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
    </div></div>
    {showPhone && <PhoneLoginModal onClose={() => setShowPhone(false)} />}
  </SiteLayout>;
}
