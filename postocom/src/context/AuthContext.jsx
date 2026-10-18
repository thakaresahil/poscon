import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { AUTH_LOGOUT_EVENT } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  // null, "login" or "register"
  const [authDialog, setAuthDialog] = useState(null);
  // Only used to show admin pages; the API checks admin access on every request
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsAdmin(false);
      setCheckingRole(false);
      return;
    }
    setCheckingRole(true);
    api
      .get("/profile")
      .then((response) => setIsAdmin(Boolean(response.data.is_admin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setCheckingRole(false));
  }, [token]);

  const login = useCallback((newToken, uid) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("uid", uid);
    setToken(newToken);
    setAuthDialog(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    setToken(null);
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setToken(null);
      setAuthDialog("login");
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleExpired);
  }, []);

  const value = {
    token,
    isLoggedIn: Boolean(token),
    isAdmin,
    checkingRole,
    login,
    logout,
    authDialog,
    openLogin: () => setAuthDialog("login"),
    openRegister: () => setAuthDialog("register"),
    closeAuthDialog: () => setAuthDialog(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
