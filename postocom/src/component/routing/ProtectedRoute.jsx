import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isLoggedIn, openLogin } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      openLogin();
    }
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default ProtectedRoute;
