import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const { error } = useToast();

  const isAllowed = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!loading && user && !isAllowed) {
      error(`Access restricted: Your account role (${user.role.toUpperCase()}) cannot view this dashboard.`);
    }
  }, [loading, user, isAllowed]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    // Prevent unauthorized cross-role URL tampering by routing directly to their verified role dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <>{children}</>;
};
