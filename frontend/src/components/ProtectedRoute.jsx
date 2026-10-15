// frontend/src/components/ProtectedRoute.jsx
//
// WHAT:  A route guard component that protects pages requiring authentication.
//
// HOW IT WORKS:
//   1. Reads `customer` and `loading` from `useAuth()`
//   2. If still loading initial session check -> render Loading state
//   3. If no customer is logged in -> redirect to /login using <Navigate />
//   4. If customer is authenticated -> render the protected component (children or Outlet)

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { customer, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center loading-container">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!customer) {
    // Redirect to login, replacing current browser history entry
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
