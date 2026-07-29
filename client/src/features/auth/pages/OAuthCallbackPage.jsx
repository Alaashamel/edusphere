import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { setAccessToken } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [state, setState] = useState("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      setState("error");
      setMessage("Authentication failed. Please try again.");
      return;
    }

    if (!accessToken) {
      setState("error");
      setMessage("Invalid authentication response.");
      return;
    }

    setAccessToken(accessToken);

    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    }

    checkAuth()
      .then(() => {
        setState("success");
        setTimeout(() => navigate("/dashboard"), 1000);
      })
      .catch(() => {
        setState("error");
        setMessage("Failed to verify authentication. Please try logging in again.");
      });
  }, [searchParams, checkAuth, navigate]);

  if (state === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Signed in successfully!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
      <div className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Back to Login
        </button>
      </div>
    </div>
  );
}
