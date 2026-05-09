import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud } from "lucide-react";
import { r2Service } from "../services/r2Service";
import Button from "../components/ui/Button";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await r2Service.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-[#0d0f12]">
      <div
        className="w-full max-w-sm bg-[#13161b] border border-[#252b36] rounded-2xl p-10 flex flex-col items-center
   gap-2 shadow-2xl"
      >
        <div className="w-14 h-14 bg-[rgba(79,142,247,0.12)] rounded-2xl flex items-center justify-center mb-1">
          <Cloud size={28} color="#4f8ef7" />
        </div>
        <h1
          className="font-bold text-2xl text-[#e8eaed] tracking-tight"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Forgot Password
        </h1>
        <p className="text-[13px] text-[#4a5568] mb-2 text-center">
          Enter your email and we'll send you a reset link
        </p>

        {sent ? (
          <p className="text-sm text-green-400 text-center mt-2">
            If that email is registered, a reset link has been sent.
          </p>
        ) : (
          <div className="w-full flex flex-col gap-3 mt-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl py-2.5 px-3.5 text-sm text-[#e8eaed]
  placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
            />
            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleSubmit}
              className="w-full
  justify-center"
            >
              Send Reset Link
            </Button>
          </div>
        )}

        <p className="text-[12.5px] text-[#4a5568] mt-3">
          <button
            onClick={() => navigate("/login")}
            className="text-[#4f8ef7] hover:text-[#6ba0f9] transition-colors
  cursor-pointer"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
