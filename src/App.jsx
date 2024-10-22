import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./components/layout";
import Dashboard from "./Modules/Dashboard/dashboardNotifications";
import Profile from "./Modules/Profile/profile";
import LoginPage from "./pages/login";
import ForgotPassword from "./pages/forgotPassword";
import AcademicPage from "./Modules/Academic/index";
import ValidateAuth from "./helper/validateauth";

import CompAnnounements from "./Modules/Health Center/Compounder/Announcement/Announements";
import Record from "./Modules/Health Center/Compounder/Announcement/Record";
import Apply from "./Modules/Health Center/Patient/Medical Relief/Apply";
import Approval from "./Modules/Health Center/Patient/Medical Relief/Approval";
import History from "./Modules/Health Center/Patient/History/History";
import Prescription from "./Modules/Health Center/Patient/History/Prescription";
import Announcement from "./Modules/Health Center/Patient/Announcements/Announcement";
import HistoryCompounder from "./Modules/Health Center/Compounder/History/HistoryComp";
import UpdatePatient from "./Modules/Health Center/Compounder/History/UpdatePatient";
import Inbox from "./Modules/Health Center/Compounder/Medical Relief/Inbox";
import Application from "./Modules/Health Center/Compounder/Medical Relief/Application";
import ManageStock from "./Modules/Health Center/Compounder/Stocks/ManageStocksNav";
import ViewSchedule from "./Modules/Health Center/Patient/Schedule/Viewdoctor";
import Feedback from "./Modules/Health Center/Patient/Feedback/feedback";
import Viewdoctor from "./Modules/Health Center/Compounder/Schedule/viewdoctor";
import Viewpath from "./Modules/Health Center/Compounder/Schedule/viewpath";
import Editdoctor from "./Modules/Health Center/Compounder/Schedule/editdoctor";
import Editpath from "./Modules/Health Center/Compounder/Schedule/editpath";
import FeedbackTable from "./Modules/Health Center/Compounder/Feedback/feedback";

export default function App() {
  const location = useLocation();
  return (
    <MantineProvider>
      <Notifications
        position="top-right"
        zIndex={1000}
        autoClose={2000}
        limit={1}
      />
      {location.pathname !== "/accounts/login" &&
        location.pathname !== "/reset-password" && <ValidateAuth />}
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
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/compounder/announcement"
          element={
            <Layout>
              <CompAnnounements />
            </Layout>
          }
        />
        <Route
          path="/compounder/announcement/record"
          element={
            <Layout>
              <Record />
            </Layout>
          }
        />

        <Route
          path="/patient/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />
        <Route
          path="/compounder/managestock"
          element={
            <Layout>
              <ManageStock />
            </Layout>
          }
        />
        <Route
          path="/compounder/medical-relief/application"
          element={
            <Layout>
              <Application />
            </Layout>
          }
        />
        <Route
          path="/patient/history/view"
          element={
            <Layout>
              <Prescription />
            </Layout>
          }
        />

        <Route
          path="/patient/announcements"
          element={
            <Layout>
              <Announcement />
            </Layout>
          }
        />

        <Route
          path="/patient/medical-relief/apply"
          element={
            <Layout>
              <Apply />
            </Layout>
          }
        />

        <Route
          path="/patient/medical-relief/approval"
          element={
            <Layout>
              <Approval />
            </Layout>
          }
        />

        <Route
          path="/compounder/patient-log/history"
          element={
            <Layout>
              <HistoryCompounder />
            </Layout>
          }
        />

        <Route
          path="/compounder/patient-log/update"
          element={
            <Layout>
              <UpdatePatient />
            </Layout>
          }
        />

        <Route
          path="/compounder/medical-relief/inbox"
          element={
            <Layout>
              <Inbox />
            </Layout>
          }
        />

        <Route
          path="/compounder/medical-relief/application"
          element={
            <Layout>
              <Application />
            </Layout>
          }
        />

        <Route
          path="/patient/viewschedule"
          element={
            <Layout>
              <ViewSchedule />
            </Layout>
          }
        />
        <Route
          path="/patient/feedback"
          element={
            <Layout>
              <Feedback />
            </Layout>
          }
        />
        <Route
          path="/compounder/feedback"
          element={
            <Layout>
              <FeedbackTable />
            </Layout>
          }
        />

        <Route
          path="/compounder/viewdoctor"
          element={
            <Layout>
              <Viewdoctor />
            </Layout>
          }
        />
        <Route
          path="/compounder/editdoctor"
          element={
            <Layout>
              <Editdoctor />
            </Layout>
          }
        />
        <Route
          path="/compounder/viewpath"
          element={
            <Layout>
              <Viewpath />
            </Layout>
          }
        />
        <Route
          path="/compounder/editpath"
          element={
            <Layout>
              <Editpath />
            </Layout>
          }
        />

        <Route path="/accounts/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </MantineProvider>
  );
}
