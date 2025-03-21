import { createTheme, MantineProvider } from "@mantine/core";
import { useSelector } from "react-redux";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
// import { IwdRoutes } from "./Modules/Iwd/routes/index";
import IwdModule from "./Modules/Iwd/index";
import { DesignationsProvider } from "./Modules/Iwd/helper/designationContext";
import Dashboard from "./Modules/Dashboard/dashboardNotifications";
import ComplaintSystem from "./Modules/ComplaintManagement/index";
import Profile from "./Modules/Dashboard/StudentProfile/profilePage";
import LoginPage from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import AcademicPage from "./Modules/Academic/index";
import ValidateAuth from "./helper/validateauth";
import MessPage from "./Modules/Mess/pages/index";
import FileTracking from "./Modules/FileTracking";
import VisitorsContent from "./Modules/Visitors_Hostel/visitorsContent";
import CancellationRequest from "./Modules/Visitors_Hostel/cancellationRequest";
import BookingForm from "./Modules/Visitors_Hostel/bookingForm";
import Bookings from "./Modules/Visitors_Hostel/bookings";
import ActiveBookingsPage from "./Modules/Visitors_Hostel/activeBookings";
import CompletedBookingsPage from "./Modules/Visitors_Hostel/completedBookings";
import VHGuidelinesPage from "./Modules/Visitors_Hostel/vhGuidelines";
import InventoryManagement from "./Modules/Visitors_Hostel/inventory";
import RoomsAvailibility from "./Modules/Visitors_Hostel/roomsAvailability";
import AccountStatemnts from "./Modules/Visitors_Hostel/accountStatements";
import FacultyProfessionalProfile from "./Modules/facultyProfessionalProfile/facultyProfessionalProfile";
import { HealthCenter } from "./Modules/Health Center";

// eslint-disable-next-line import/no-unresolved
import ConvenorBreadcumbs from "./Modules/Scholarship/convenor/components/ConvenorBreadcumbs";
import UserBreadcrumbs from "./Modules/Scholarship/user/components/UserBreadcumbs";

import InactivityHandler from "./helper/inactivityhandler";
import DepartmentPage from "./Modules/Department/DepartmentDashboard";

const theme = createTheme({
  breakpoints: {
    xxs: "300px",
    xs: "375px",
    sm: "768px",
    md: "992px",
    lg: "1200px",
    xl: "1408px",
  },
});

export default function App() {
  const location = useLocation();
  const role = useSelector((state) => state.user.role);
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" autoClose={2000} limit={1} />
      {location.pathname !== "/accounts/login" && <ValidateAuth />}
      {location.pathname !== "/accounts/login" && <InactivityHandler />}

      <Routes>
        <Route path="/" element={<Navigate to="/accounts/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/academics"
          element={
            <Layout>
              <AcademicPage />
            </Layout>
          }
        />
        <Route
          path="/mess"
          element={
            <Layout>
              <MessPage />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/iwd"
          element={
            <DesignationsProvider>
              <Layout>
                <IwdModule />
              </Layout>
            </DesignationsProvider>
          }
        />
        <Route
          path="/filetracking"
          element={
            <Layout>
              <FileTracking />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel"
          element={
            <Layout>
              <VisitorsContent />
              <Bookings />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/cancel_request"
          element={
            <Layout>
              <VisitorsContent />
              <CancellationRequest />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/active_bookings"
          element={
            <Layout>
              <VisitorsContent />
              <ActiveBookingsPage />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/completed_bookings"
          element={
            <Layout>
              <VisitorsContent />
              <CompletedBookingsPage />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/booking-form"
          element={
            <Layout>
              <VisitorsContent />
              <BookingForm />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/room-availability"
          element={
            <Layout>
              <VisitorsContent />
              <RoomsAvailibility />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/mess-record"
          element={
            <Layout>
              <VisitorsContent />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/inventory"
          element={
            <Layout>
              <VisitorsContent />
              <InventoryManagement />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/account-statement"
          element={
            <Layout>
              <VisitorsContent />
              <AccountStatemnts />
            </Layout>
          }
        />
        <Route
          path="/visitors_hostel/rules"
          element={
            <Layout>
              <VisitorsContent />
              <VHGuidelinesPage />
            </Layout>
          }
        />
        <Route
          path="/facultyprofessionalprofile/*"
          element={
            <Layout>
              <FacultyProfessionalProfile />
            </Layout>
          }
        />
        <Route
          path="/complaints"
          element={
            <Layout>
              <ComplaintSystem />
            </Layout>
          }
        />
        <Route
          path="/department"
          element={
            <Layout>
              <DepartmentPage />
            </Layout>
          }
        />

        {/* scholarship */}
        <Route
          path="/scholarship"
          element={
            <Layout>
              {role === "spacsconvenor" && <ConvenorBreadcumbs />}
              {role === "student" && <UserBreadcrumbs />}
              {role === "spacsassistant" && <ConvenorBreadcumbs />}
            </Layout>
          }
        />

        <Route path="/healthcenter/*" element={<HealthCenter />} />
        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </MantineProvider>
  );
}
