import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminDashboard from '../pages/AdminDashboard';
import OrganizationManagement from '../pages/OrganizationManagement';
import OrganizationDetails from '../pages/OrganizationDetails';
import Settings from '../pages/Settings';
import OnboardingAccept from '../pages/OnboardingAccept';
import Login from '../pages/Login';
import EntityManagement from '../pages/EntityManagement';
import JobsManagement from '../pages/JobsManagement';
import JobDetails from '../pages/JobDetails';
import UserManagement from '../pages/UserManagement';
import CandidateManagement from '../pages/CandidateManagement';
import NotFound from '../pages/NotFound';

// Organization Jobs
import PostJobWizard from '../features/organization/jobs/PostJobWizard';

import ProtectedRoute from '../components/ProtectedRoute';

export const routes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'organizations', element: <OrganizationManagement /> },
      { path: 'organizations/:id', element: <OrganizationDetails /> },
      { path: 'settings', element: <Settings /> },
      { path: 'entities', element: <EntityManagement /> },
      { path: 'jobs/post', element: <PostJobWizard /> },
      { path: 'jobs', element: <JobsManagement /> },
      { path: 'jobs/:id', element: <JobDetails /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'candidates', element: <CandidateManagement /> },
      { path: 'admins', element: <Navigate to="/settings" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'onboarding', element: <OnboardingAccept /> },
      { path: '', element: <Navigate to="login" replace /> },
    ],
  },
];
