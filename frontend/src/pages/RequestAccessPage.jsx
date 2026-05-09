import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import { r2Service } from "../services/r2Service";

export default function RequestAccessPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill email if coming from Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, []);

  async function handleSubmit() {
    if (!username || !email || !password || !reason) {
      setError("All fields are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await r2Service.requestAccess(username, email, password, reason);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div
        className="h-full flex items-center justify-center bg-[#0d0f12]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(79,142,247,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(62,207,142,0.05) 0%, transparent 60%)
          `,
        }}
      >
        <div className="w-full max-w-sm bg-[#13161b] border border-[#252b36] rounded-2xl p-10 flex flex-col items-center gap-3 shadow-2xl">
          <div className="w-14 h-14 bg-[rgba(62,207,142,0.12)] rounded-2xl flex items-center justify-center mb-1">
            <Cloud size={28} color="#3ecf8e" />
          </div>
          <h1
            className="font-bold text-xl text-[#e8eaed] tracking-tight text-center"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Request Submitted!
          </h1>
          <p className="text-sm text-[#8b95a3] text-center">
            Your request has been sent to the admin for review. You'll be able
            to login once it's approved.
          </p>
          <Button
            variant="primary"
            className="w-full justify-center mt-2"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex items-center justify-center bg-[#0d0f12]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 30% 20%, rgba(79,142,247,0.07) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 80%, rgba(62,207,142,0.05) 0%, transparent 60%)
        `,
      }}
    >
      <div className="w-full max-w-sm bg-[#13161b] border border-[#252b36] rounded-2xl p-10 flex flex-col items-center gap-2 shadow-2xl">
        {/* Logo */}
        <div className="w-14 h-14 bg-[rgba(79,142,247,0.12)] rounded-2xl flex items-center justify-center mb-1">
          <Cloud size={28} color="#4f8ef7" />
        </div>
        <h1
          className="font-bold text-2xl text-[#e8eaed] tracking-tight"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Request Access
        </h1>
        <p className="text-[13px] text-[#4a5568] mb-2 text-center">
          Fill in your details and the admin will review your request
        </p>

        {/* Form */}
        <div className="w-full flex flex-col gap-3 mt-2">
          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl py-2.5 px-3.5 text-sm text-[#e8eaed] placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl py-2.5 px-3.5 text-sm text-[#e8eaed] placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#0d0f12] border rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-[#e8eaed] placeholder-[#4a5568] outline-none transition-colors
                ${error ? "border-red-500" : "border-[#252b36] focus:border-[#4f8ef7]"}`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#e8eaed] transition-colors cursor-pointer"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Reason */}
          <textarea
            placeholder="Why do you need access?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={`w-full bg-[#0d0f12] border rounded-xl py-2.5 px-3.5 text-sm text-[#e8eaed] placeholder-[#4a5568] outline-none transition-colors resize-none
              ${error ? "border-red-500" : "border-[#252b36] focus:border-[#4f8ef7]"}`}
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center"
          >
            Submit Request
          </Button>
        </div>

        {/* Back to login */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-[12.5px] text-[#4a5568] hover:text-[#e8eaed] transition-colors cursor-pointer mt-2"
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>
      </div>
    </div>
  );
}
