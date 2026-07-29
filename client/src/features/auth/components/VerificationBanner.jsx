import { useState } from "react";
import { ShieldAlert, Loader2, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";
import authService from "../../../services/auth.service";

export default function VerificationBanner() {
  const { user, updateUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification();
      toast.success("Verification email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mb-0">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
          Please verify your email address to unlock all features.
        </p>
        <button
          onClick={handleResend}
          disabled={sending}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 disabled:opacity-50"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Resend
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
