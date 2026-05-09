import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Eye, EyeOff } from "lucide-react";
import { r2Service } from "../services/r2Service";
import Button from "../components/ui/Button";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  async function handleSubmit() {
    if (!newPassword) {
      setError("Password is required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await r2Service.resetPassword(token, newPassword);
      setDone(true);
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
          Reset Password
        </h1>
        <p className="text-[13px] text-[#4a5568] mb-2 text-center">
          Enter your new password below
        </p>

        {done ? (
          <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-sm text-green-400 text-center">
              Password reset successfully!
            </p>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 mt-2">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
                className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl py-2.5 pl-3.5 pr-10 text-sm
  text-[#e8eaed] placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#e8eaed]
  transition-colors cursor-pointer"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
              Reset Password
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
