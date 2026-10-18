import { useAuth } from "../../context/AuthContext";
import Loading from "../loading/Loading";
import NotFound from "../notfound/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Non-admins see the normal 404 page so admin URLs are not advertised
function AdminRoute({ children }) {
  const { isAdmin, checkingRole } = useAuth();

  return (
    <ProtectedRoute>
      {checkingRole ? (
        <div className="my-16">
          <Loading />
        </div>
      ) : isAdmin ? (
        children
      ) : (
        <NotFound />
      )}
    </ProtectedRoute>
  );
}

export default AdminRoute;
