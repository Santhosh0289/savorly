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
  const [notice, setNotice] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [resetStep, setResetStep] = useState(null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login, requestPasswordReset, resetPassword } = useAuth();
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

  const requestReset = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await requestPasswordReset(resetEmail);
      setResetStep("verify");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not send a reset code. Please try again.");
    }
  };

  const finishReset = async (event) => {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await resetPassword(resetEmail, resetOtp, newPassword);
      setEmail(resetEmail);
      setPassword("");
      setNotice("Password updated. You can now log in.");
      setResetStep(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not reset your password. Please try again.");
    }
  };

  const cancelReset = () => {
    setError("");
    setResetStep(null);
  };

  return <SiteLayout>
    <div className="auth-page"><div className="auth-card">
      {!resetStep ? <>
        <h2>Welcome back</h2>
        <GoogleLoginButton />
        <button className="btn btn-ghost auth-full-button auth-provider-button" type="button" onClick={() => setShowPhone(true)}>Continue with phone</button>
        <div className="auth-divider">or continue with email</div>
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="button" className="auth-text-button" onClick={() => { setError(""); setNotice(""); setResetEmail(email); setResetStep("request"); }}>Forgot password?</button>
          {notice && <p className="success-text" role="status">{notice}</p>}
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn btn-primary auth-full-button">Login</button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Register</Link></p>
      </> : resetStep === "request" ? <>
        <h2>Reset your password</h2>
        <p className="auth-otp-copy">Enter your account email and we will send a 6-digit reset code.</p>
        <form onSubmit={requestReset}>
          <div className="field"><label>Email</label><input type="email" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} required /></div>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn btn-primary auth-full-button">Send reset code</button>
          <button type="button" className="btn btn-ghost auth-full-button auth-back-button" onClick={cancelReset}>Back to login</button>
        </form>
      </> : <>
        <h2>Choose a new password</h2>
        <p className="auth-otp-copy">Enter the 6-digit code sent to <strong>{resetEmail}</strong>.</p>
        <form onSubmit={finishReset}>
          <div className="field"><label>Reset code</label><input inputMode="numeric" maxLength={6} value={resetOtp} onChange={(event) => setResetOtp(event.target.value)} required /></div>
          <div className="field"><label>New password</label><input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div>
          <div className="field"><label>Confirm new password</label><input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="btn btn-primary auth-full-button">Update password</button>
          <button type="button" className="btn btn-ghost auth-full-button auth-back-button" onClick={() => setResetStep("request")}>Use a different email</button>
        </form>
      </>}
    </div></div>
    {showPhone && <PhoneLoginModal onClose={() => setShowPhone(false)} />}
  </SiteLayout>;
}
