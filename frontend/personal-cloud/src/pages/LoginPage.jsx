import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cloud, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      navigate("/drive");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin((s) => !s);
    setError("");
    setUsername("");
    setPassword("");
  }

  function handleGoogleLogin() {
    window.location.href = "http://localhost:8787/auth/google";
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
          MyDrive
        </h1>
        <p className="text-[13px] text-[#4a5568] mb-2">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>

        {/* Form */}
        <div className="w-full flex flex-col gap-3 mt-2">
          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
            className="w-full bg-[#0d0f12] border border-[#252b36] rounded-xl py-2.5 px-3.5 text-sm text-[#e8eaed] placeholder-[#4a5568] outline-none focus:border-[#4f8ef7] transition-colors"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </div>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#252b36]" />
          <span className="text-[11.5px] text-[#4a5568]">or</span>
          <div className="flex-1 h-px bg-[#252b36]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1e25] border border-[#252b36] rounded-xl py-2.5 px-4 text-sm text-[#e8eaed] hover:bg-[#1f242d] hover:border-[#4a5568] transition-all cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Continue with Google
        </button>

        {/* Switch mode */}
        <p className="text-[12.5px] text-[#4a5568] mt-3">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={switchMode}
            className="text-[#4f8ef7] hover:text-[#6ba0f9] transition-colors cursor-pointer"
          >
            {isLogin ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
