import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service";
import { setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data.user);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    if (data.data.requiresTwoFactor) {
      return data.data;
    }
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data;
  };

  const verify2FA = async (twoFactorToken, code) => {
    const { data } = await authService.verify2FALogin(twoFactorToken, code);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore error on logout
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verify2FA,
        register,
        logout,
        updateUser,
        checkAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
