import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../../services/auth.service";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState("form");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token, { password: data.password });
      setState("success");
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setState("error");
      setMessage(error.response?.data?.message || "Reset failed. The link may have expired.");
    }
  };

  if (state === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Password Reset!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reset Failed
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Invalid Link
        </h2>
        <p className="text-gray-500 dark:text-gray-400">No reset token provided.</p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Set new password
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input pr-10"
              placeholder="Min 8 characters"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            className="input"
            placeholder="Repeat your password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        Back to login
      </Link>
    </div>
  );
}
