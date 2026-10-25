import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DonorDashboard } from './dashboards/DonorDashboard';
import { RecipientDashboard } from './dashboards/RecipientDashboard';
import { VolunteerDashboard } from './dashboards/VolunteerDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();

  if (!user) return null;

  switch (role) {
    case 'donor':
      return <DonorDashboard />;
    case 'recipient':
      return <RecipientDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <DonorDashboard />;
  }
};
