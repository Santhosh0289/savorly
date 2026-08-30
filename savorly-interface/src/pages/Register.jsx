import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import SiteLayout from "../components/SiteLayout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [step, setStep] = useState("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "" });
  const [error, setError] = useState("");
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
    try {
      await sendOtp(form.email);
      setStep("verify");
    } catch (err) {
      setError(err.response?.data?.error || "Could not send verification code.");
    }
  };
  const finishRegistration = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  };

  return <SiteLayout><div className="auth-page"><div className="auth-card">
    <h2>Create your account</h2>
    {step === "details" && <><GoogleLoginButton /><div className="auth-divider">or register with email</div>
      <form onSubmit={requestOtp}>
        <div className="field"><label>Name</label><input name="name" value={form.name} onChange={change} required /></div>
        <div className="field"><label>Email</label><input type="email" name="email" value={form.email} onChange={change} required /></div>
        <div className="field"><label>Phone (optional)</label><input type="tel" name="phone" value={form.phone} onChange={change} /></div>
        <div className="field"><label>Password</label><input type="password" name="password" value={form.password} onChange={change} minLength={8} required /></div>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn btn-primary auth-full-button">Send verification code</button>
      </form>
    </>}
    {step === "verify" && <form onSubmit={finishRegistration}>
      <p className="auth-otp-copy">We sent a 6-digit code to <strong>{form.email}</strong>.</p>
      <div className="field"><label>Verification code</label><input name="otp" inputMode="numeric" maxLength={6} value={form.otp} onChange={change} required /></div>
      {error && <p className="error-text" role="alert">{error}</p>}
      <button className="btn btn-primary auth-full-button">Verify & create account</button>
      <button type="button" className="btn btn-ghost auth-full-button auth-back-button" onClick={() => setStep("details")}>Back</button>
    </form>}
  </div></div></SiteLayout>;
}
