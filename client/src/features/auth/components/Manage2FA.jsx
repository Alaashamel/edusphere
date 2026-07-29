import { useState, useEffect } from "react";
import { Shield, ShieldOff, Loader2, Copy, CheckCircle2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../services/auth.service";
import { useAuth } from "../../../contexts/AuthContext";

export default function Manage2FA() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState(user?.twoFactorEnabled ? "disable" : "setup");
  const [step, setStep] = useState("initial");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setTab("disable");
    }
  }, [user]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await authService.setup2FA();
      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setStep("scan");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (code.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await authService.enable2FA(code);
      toast.success("2FA enabled successfully");
      updateUser({ twoFactorEnabled: true });
      setTab("disable");
      setStep("initial");
      setCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }
    setLoading(true);
    try {
      await authService.disable2FA(password);
      toast.success("2FA disabled");
      updateUser({ twoFactorEnabled: false });
      setTab("setup");
      setStep("initial");
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tab === "disable") {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your account is protected with 2FA</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg text-sm text-amber-800 dark:text-amber-200">
            Disabling 2FA will make your account less secure. Enter your password to confirm.
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="input"
          />
          <button
            onClick={handleDisable}
            disabled={loading || !password}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
            Disable 2FA
          </button>
        </div>
      </div>
    );
  }

  if (step === "initial") {
    return (
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <p>Use an authenticator app like Google Authenticator or Authy to scan the QR code and enter the generated code.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Download an authenticator app on your phone</li>
            <li>Scan the QR code when you set up</li>
            <li>Enter the 6-digit code to enable</li>
          </ul>
        </div>

        <button
          onClick={handleSetup}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
          Set Up 2FA
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Scan QR Code</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scan with your authenticator app</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {qrCode && (
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border border-gray-200 dark:border-dark-border rounded-lg" />
        )}

        <div className="w-full max-w-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Or enter this key manually:</p>
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
            <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{secret}</code>
            <button onClick={copySecret} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="input text-center text-lg tracking-widest font-mono"
            maxLength={6}
          />
          <button
            onClick={handleEnable}
            disabled={loading || code.length !== 6}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
