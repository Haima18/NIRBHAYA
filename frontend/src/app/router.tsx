import React from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
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
import { UserProfilePage } from '@/features/profile/UserProfilePage';
import { MapPage } from '@/features/map/MapPage';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/signup" replace />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignUpPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/map" replace /> },
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
  }
]);
