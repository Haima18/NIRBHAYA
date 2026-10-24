import React from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PhysicalSafetyPage } from '@/features/physical-safety/PhysicalSafetyPage';
import { DigitalGuardianPage } from '@/features/digital-guardian/DigitalGuardianPage';
import { PrivacyShieldPage } from '@/features/privacy-shield/PrivacyShieldPage';
import { DeepfakeDetectivePage } from '@/features/deepfake-detective/DeepfakeDetectivePage';
import { PathwayPage } from '@/features/nirbhaya-pathway/PathwayPage';
import { HerCirclePage } from '@/features/hercircle/HerCirclePage';
import { LegalSupportPage } from '@/features/legal-support/LegalSupportPage';
import { EvidenceVaultPage } from '@/features/evidence-vault/EvidenceVaultPage';
import { AiAssistantPage } from '@/features/ai-assistant/AiAssistantPage';
import { SafetyNewsPage } from '@/features/safety-news/SafetyNewsPage';
import { EmpowermentPage } from '@/features/empowerment/EmpowermentPage';
import { EmergencyDirectoryPage } from '@/features/emergency-directory/EmergencyDirectoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { MapPage } from '@/features/map/MapPage';
import { WelcomePage } from '@/features/welcome/WelcomePage';
import { PublicSharePage } from '@/features/location-share/PublicSharePage';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  return isAuthenticated
    ? <>{children}</>
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <WelcomePage />
  },
  {
    path: '/login',
    element: <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
  },
  {
    path: '/signup',
    element: <PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>
  },
  {
    path: '/forgot-password',
    element: <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>
  },
  {
    path: '/reset-password',
    element: <PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>
  },
  {
    path: '/share/:token',
    element: <PublicSharePage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'physical-safety', element: <PhysicalSafetyPage /> },
      { path: 'digital-guardian', element: <DigitalGuardianPage /> },
      { path: 'privacy-shield', element: <PrivacyShieldPage /> },
      { path: 'deepfake-detective', element: <DeepfakeDetectivePage /> },
      { path: 'pathway', element: <PathwayPage /> },
      { path: 'hercircle', element: <HerCirclePage /> },
      { path: 'legal-support', element: <LegalSupportPage /> },
      { path: 'evidence-vault', element: <EvidenceVaultPage /> },
      { path: 'ai-assistant', element: <AiAssistantPage /> },
      { path: 'safety-news', element: <SafetyNewsPage /> },
      { path: 'empowerment', element: <EmpowermentPage /> },
      { path: 'emergency-directory', element: <EmergencyDirectoryPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
