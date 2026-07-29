import api from "./api";

const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.patch("/auth/me", data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post("/auth/resend-verification"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  refreshToken: () => api.post("/auth/refresh-token"),
  setup2FA: () => api.get("/auth/2fa/setup"),
  enable2FA: (code) => api.post("/auth/2fa/enable", { code }),
  disable2FA: (password) => api.post("/auth/2fa/disable", { password }),
  verify2FALogin: (twoFactorToken, code) => api.post("/auth/2fa/verify", { twoFactorToken, code }),
};

export default authService;
