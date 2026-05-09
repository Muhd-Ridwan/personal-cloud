import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");

    if (token && username) {
      loginWithToken(token, username);
      navigate("/drive");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="h-full flex items-center justify-center bg-[#0d0f12]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#4f8ef7] border-t-transparent animate-spin" />
        <p className="text-[#8b95a3] text-sm">Signing in...</p>
      </div>
    </div>
  );
}
