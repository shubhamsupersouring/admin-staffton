import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  canAccessRoute,
  getDefaultRouteForRole,
  getUserRole,
} from '../utils/permission';

/**
 * Blocks routes the current role is not allowed to access.
 * Redirects to the role's default landing page instead of showing a 404.
 */
const RoleGuard = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = getUserRole(user);

  if (!canAccessRoute(role, location.pathname)) {
    const fallback = getDefaultRouteForRole(role);
    return <Navigate to={fallback} replace state={{ from: location }} />;
  }

  return children;
};

export default RoleGuard;
