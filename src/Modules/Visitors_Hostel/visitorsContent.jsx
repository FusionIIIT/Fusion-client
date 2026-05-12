/**
 * Main Visitor Hostel Module Router
 * 
 * Handles routing for all visitor hostel pages:
 * - /visitors_hostel/          → Redirects to /visitors_hostel/bookings
 * - /visitors_hostel/bookings  → Manage bookings (pending/active)
 * - /visitors_hostel/room-availability → Check room availability
 * - /visitors_hostel/inventory  → Manage inventory
 * - /visitors_hostel/bills      → View and generate bills
 * - /visitors_hostel/check-inout → Check in/out visitors
 * 
 * Tab Navigation: VisitorsNavbar.jsx
 * Service Layer: services/visitorHostelApi.js (DO NOT use direct axios)
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VisitorsNavbar from "./VisitorsNavbar";
import {
  VH_ABSOLUTE_PATHS,
  VH_INCHARGE_ONLY_ROLES,
  VH_RELATIVE_PATHS,
  VH_STAFF_ROLES,
} from "../../routes/visitorsHostelRoutes";

// ============================================================================
// PAGE COMPONENT IMPORTS
// ============================================================================
// Import from pages/ folder as they are created during migration
// For now, import existing components and gradually refactor into pages/

// PAGE IMPORTS - properly organized
import PendingBookingsPage from "./pages/PendingBookingsPage";
import ActiveBookingsPage from "./pages/ActiveBookingsPage";
import CompletedBookingsPage from "./pages/CompletedBookingsPage";
import CancelledBookingsPage from "./pages/CancelledBookingsPage";
import RoomAvailabilityContainer from "./components/RoomAvailabilityContainer";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import GuidelinesPage from "./pages/GuidelinesPage";
import InventoryManagement from "./components/InventoryManagement";
import OverstayDashboard from "./components/OverstayDashboard";
import OverstayMonitor from "./components/OverstayMonitor";
import { ActionConfirmationProvider } from "./components/common/ActionConfirmationProvider";
// ============================================================================
// MAIN ROUTER COMPONENT
// ============================================================================

function ProtectedRoute({ allowedRoles, children }) {
  const role = useSelector((state) => state.user.role);

  if (role === undefined || role === null) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={VH_RELATIVE_PATHS.BOOKINGS} replace />;
  }

  return children;
}

function VisitorsContent() {
  return (
    <ActionConfirmationProvider>
      <div className="visitors-module">
        {/* Navigation Tabs */}
        <VisitorsNavbar />

        {/* Page Router */}
        <Routes>
          {/* Default redirect */}
          <Route path={VH_RELATIVE_PATHS.ROOT} element={<Navigate to={VH_RELATIVE_PATHS.BOOKINGS} replace />} />

        {/* Booking Management */}
        <Route path={VH_RELATIVE_PATHS.BOOKINGS} element={<PendingBookingsPage listMode="bookings" />} />
        <Route
          path={VH_RELATIVE_PATHS.PENDING_BOOKINGS}
          element={
            <ProtectedRoute allowedRoles={VH_STAFF_ROLES}>
              <PendingBookingsPage listMode="queue" />
            </ProtectedRoute>
          }
        />
        <Route path={VH_RELATIVE_PATHS.CANCELLED_BOOKINGS} element={<CancelledBookingsPage />} />
        <Route path={VH_RELATIVE_PATHS.ACTIVE_BOOKINGS} element={<ActiveBookingsPage />} />
        <Route path={VH_RELATIVE_PATHS.COMPLETED_BOOKINGS} element={<CompletedBookingsPage />} />

        {/* Legacy Booking Aliases */}
        <Route path={VH_RELATIVE_PATHS.PENDING_REQUESTS_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.PENDING_BOOKINGS} replace />} />
        <Route path={VH_RELATIVE_PATHS.CANCEL_REQUEST_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.CANCELLED_BOOKINGS} replace />} />
        <Route path={VH_RELATIVE_PATHS.ACTIVE_BOOKINGS_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.ACTIVE_BOOKINGS} replace />} />
        <Route path={VH_RELATIVE_PATHS.COMPLETED_BOOKINGS_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.COMPLETED_BOOKINGS} replace />} />

        {/* Room Management */}
        <Route
          path={VH_RELATIVE_PATHS.ROOM_AVAILABILITY}
          element={
            <ProtectedRoute allowedRoles={VH_STAFF_ROLES}>
              <RoomAvailabilityContainer />
            </ProtectedRoute>
          }
        />

        {/* Inventory Management */}
        <Route
          path={VH_RELATIVE_PATHS.INVENTORY}
          element={
            <ProtectedRoute allowedRoles={VH_STAFF_ROLES}>
              <InventoryManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={VH_RELATIVE_PATHS.INVENTORY_MANAGEMENT}
          element={
            <ProtectedRoute allowedRoles={VH_STAFF_ROLES}>
              <InventoryManagement />
            </ProtectedRoute>
          }
        />

        {/* Financial Reports */}
        <Route
          path={VH_RELATIVE_PATHS.BILLS}
          element={
            <ProtectedRoute allowedRoles={VH_INCHARGE_ONLY_ROLES}>
              <FinancialReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={VH_RELATIVE_PATHS.ACCOUNT_STATEMENTS}
          element={
            <ProtectedRoute allowedRoles={VH_INCHARGE_ONLY_ROLES}>
              <FinancialReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path={VH_RELATIVE_PATHS.ACCOUNT_STATEMENT_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.ACCOUNT_STATEMENTS} replace />} />

        {/* Rules */}
        <Route path={VH_RELATIVE_PATHS.GUIDELINES} element={<GuidelinesPage />} />
        <Route path={VH_RELATIVE_PATHS.RULES_LEGACY} element={<Navigate to={VH_ABSOLUTE_PATHS.GUIDELINES} replace />} />

        {/* Check-In/Out (placeholder - create CheckInOutPage.jsx when ready) */}
        {/* <Route path="check-in-out" element={<CheckInOutPage />} /> */}

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to={VH_RELATIVE_PATHS.BOOKINGS} replace />} />
        </Routes>
      </div>
    </ActionConfirmationProvider>
  );
}

export default VisitorsContent;
