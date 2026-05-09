/**
 * Health Center Module Routing
 * =============================
 * 
 * Configures all routes for the Health Center module
 * Routes are split by user role (patient/staff) for proper access control
 */

import { lazy } from 'react';
import ProtectedRoute from '../../routes/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for code splitting
const PatientDashboard = lazy(() => import('./PatientDashboard'));
const CompoundDashboard = lazy(() => import('./CompoundDashboard'));
// AuditorDashboard removed — auditor review is not part of PHC module scope.
// Backend API endpoints for auditor actions remain in views.py.

/**
 * Get Health Center routes
 * Format: { path, element, requiresAuth, roles }
 * 
 * Routes are consolidated into dashboard views with tabs:
 * - PatientDashboard: Doctor Schedules, Prescriptions, Complaints, Reimbursement
 * - CompoundDashboard: Statistics, Claims, Alerts, Doctor Management, Inventory
 */
export const getHealthCenterRoutes = () => [
  // Patient routes - all consolidated into PatientDashboard tabs
  {
    path: '/health_center/dashboard',
    element: <ErrorBoundary><PatientDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['patient', 'staff'],
    label: 'Dashboard',
  },
  {
    path: '/health_center/doctor-availability',
    element: <ErrorBoundary><PatientDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['patient', 'staff'],
    label: 'Browse Doctors',
  },
  {
    path: '/health_center/medical-history',
    element: <ErrorBoundary><PatientDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['patient', 'staff'],
    label: 'Medical History',
  },
  {
    path: '/health_center/reimbursement',
    element: <ErrorBoundary><PatientDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['patient', 'staff'],
    label: 'Reimbursement Claims',
  },

  // Staff routes - all consolidated into CompoundDashboard tabs
  {
    path: '/health_center/staff/dashboard',
    element: <ErrorBoundary><CompoundDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['phc_staff', 'accounts_staff', 'auditor'],
    label: 'Staff Dashboard',
  },
  {
    path: '/health_center/claims-processing',
    element: <ErrorBoundary><CompoundDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['phc_staff', 'accounts_staff', 'auditor'],
    label: 'Claims Processing',
  },
  {
    path: '/health_center/claims-processing/:claimId',
    element: <ErrorBoundary><CompoundDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['phc_staff', 'accounts_staff', 'auditor'],
  },
  {
    path: '/health_center/inventory',
    element: <ErrorBoundary><CompoundDashboard /></ErrorBoundary>,
    requiresAuth: true,
    roles: ['phc_staff'],
    label: 'Inventory Management',
  },
  // Auditor routes removed — not part of PHC module scope.
  // Backend endpoints remain available at /api/phc/auditor/*
];

/**
 * Generate protected routes for React Router
 * Usage: getHealthCenterRoutes().map(route => generateRoute(route))
 */
export const generateRoutes = (routes) => {
  return routes.map((route) => ({
    path: route.path,
    element: route.requiresAuth ? (
      <ProtectedRoute roles={route.roles}>
        {route.element}
      </ProtectedRoute>
    ) : (
      route.element
    ),
  }));
};

/**
 * Navigation menu items (for sidebar/navigation)
 */
export const getHealthCenterNavItems = () => {
  return [
    {
      section: 'PATIENT',
      items: [
        {
          label: 'Dashboard',
          href: '/health_center/dashboard',
          icon: 'IconHome',
          roles: ['patient', 'staff'],
        },
        {
          label: 'Book Appointment',
          href: '/health_center/doctor-availability',
          icon: 'IconCalendar',
          roles: ['patient', 'staff'],
        },
        {
          label: 'Medical Records',
          href: '/health_center/medical-history',
          icon: 'IconFileText',
          roles: ['patient', 'staff'],
        },
        {
          label: 'Reimbursement',
          href: '/health_center/reimbursement',
          icon: 'IconDollar',
          roles: ['patient', 'staff'],
        },
      ],
    },
    {
      section: 'STAFF',
      items: [
        {
          label: 'Staff Dashboard',
          href: '/health_center/staff/dashboard',
          icon: 'IconLayoutDashboard',
          roles: ['phc_staff', 'accounts_staff', 'auditor'],
        },
        {
          label: 'Process Claims',
          href: '/health_center/claims-processing',
          icon: 'IconClipboardCheck',
          roles: ['phc_staff', 'accounts_staff', 'auditor'],
        },
        {
          label: 'Inventory',
          href: '/health_center/inventory',
          icon: 'IconPackage',
          roles: ['phc_staff'],
        },
        // Auditor Dashboard nav item removed — not part of PHC scope
      ],
    },
  ];
};

export default getHealthCenterRoutes;
