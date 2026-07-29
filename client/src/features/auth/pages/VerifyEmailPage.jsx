import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import authService from "../../../services/auth.service";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [state, setState] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Invalid verification link.");
      return;
    }

    authService
      .verifyEmail(token)
      .then(({ data }) => {
        setState("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setState("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-8 text-center">
          {state === "verifying" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Verifying your email...
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Email Verified!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
              <Link to="/dashboard" className="btn-primary inline-flex mt-4">
                Go to Dashboard
              </Link>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Verification Failed
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Mail className="w-4 h-4 text-gray-400" />
                <Link to="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Resend verification email
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
