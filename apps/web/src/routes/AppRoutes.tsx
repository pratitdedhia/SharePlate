import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DonationsPage } from '../pages/DonationsPage';
import { DonationDetailPage } from '../pages/DonationDetailPage';
import { CreateDonationPage } from '../pages/CreateDonationPage';
import { MyDonationsPage } from '../pages/MyDonationsPage';
import { MyClaimsPage } from '../pages/MyClaimsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ImpactPage } from '../pages/ImpactPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminPage } from '../pages/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/donations" element={<DonationsPage />} />
      <Route path="/donations/:id" element={<DonationDetailPage />} />
      <Route path="/impact" element={<ImpactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations/new"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['donor', 'admin']}>
              <CreateDonationPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-donations"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['donor', 'admin']}>
              <MyDonationsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-claims"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['recipient', 'volunteer', 'admin']}>
              <MyClaimsPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <AdminPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
