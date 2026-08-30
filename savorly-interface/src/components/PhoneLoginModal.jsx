import { useState } from "react";
import { MessageSquare, Phone, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PhoneLoginModal({ onClose }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState("voice");
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { loginWithPhone } = useAuth();
  const navigate = useNavigate();

  const sendOtp = async () => {
    setError("");
    setSending(true);
    try {
      await api.post("/auth/send-phone-otp", { phone, channel });
      setStep("otp");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not send OTP. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    try {
      const user = await loginWithPhone(phone, otp);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Invalid or expired OTP. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="auth-card phone-auth-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h2>Continue with phone</h2>
        {step === "phone" ? <>
          <div className="field"><label>10-digit mobile number</label><input type="tel" inputMode="numeric" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="field">
            <label>How should we send the code?</label>
            <div className="channel-toggle">
              <button type="button" className="channel-option channel-option-unavailable" disabled aria-describedby="sms-unavailable-note"><MessageSquare size={16} />SMS unavailable</button>
              <button type="button" className={`channel-option ${channel === "voice" ? "active" : ""}`} onClick={() => setChannel("voice")}><Phone size={16} />Call</button>
            </div>
            <p id="sms-unavailable-note" className="channel-unavailable-note">SMS delivery is temporarily unavailable. Choose a call to receive your code.</p>
          </div>
          <button type="button" className="btn btn-primary auth-full-button" onClick={sendOtp} disabled={sending || !phone}>{sending ? "Sending..." : channel === "voice" ? "Call me with a code" : "Send OTP via SMS"}</button>
        </> : <>
          <p className="auth-otp-copy">{channel === "voice" ? "We'll call you now — enter the code you hear." : `We sent a code to ${phone} via SMS.`}</p>
          <div className="field"><label>6-digit OTP</label><input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} /></div>
          <button type="button" className="btn btn-primary auth-full-button" onClick={verifyOtp}>Verify & Continue</button>
          <button type="button" className="btn btn-ghost auth-full-button auth-back-button" onClick={() => setStep("phone")}>Change number or method</button>
        </>}
        {error && <p className="error-text" role="alert">{error}</p>}
      </div>
    </div>
  );
}
