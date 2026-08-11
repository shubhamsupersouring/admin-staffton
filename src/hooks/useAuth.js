import { useSelector } from 'react-redux';
import {
  getUserRole,
  hasPermission,
  canPerformAction,
  ROLES,
  PERMISSIONS,
} from '../utils/permission';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const role = getUserRole(user);

  return {
    user,
    isAuthenticated,
    loading,
    role,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isSeoManager: role === ROLES.SEO_MANAGER,
    hasPermission: (permission) => hasPermission(role, permission),
    canPerformAction: (permission, action) => canPerformAction(role, permission, action),
    PERMISSIONS,
  };
};
