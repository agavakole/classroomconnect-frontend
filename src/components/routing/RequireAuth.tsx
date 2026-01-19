import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type Role = "teacher" | "student";

interface RequireAuthProps {
  roles?: Role[];
  children?: ReactNode;
}

function getLoginPath(roles?: Role[]) {
  if (roles?.length === 1) {
    return roles[0] === "teacher" ? "/login/teacher" : "/login/student";
  }
  return "/login/student";
}

export function RequireAuth({ roles, children }: RequireAuthProps) {
  const location = useLocation();
  const { token, role } = useAuth();

  if (!token || !role) {
    return (
      <Navigate
        to={getLoginPath(roles)}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (roles && !roles.includes(role)) {
    const fallback = role === "teacher" ? "/teacher/courses" : "/student";
    return <Navigate to={fallback} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
