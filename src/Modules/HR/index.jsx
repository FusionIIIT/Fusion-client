import React from "react";
import { Routes, Route } from "react-router-dom";
import HrDashboard from "./pages/Hr_Dashboard"; // Ensure correct path
import LeavePage from "./pages/LeavePage"; // Adjust the import path if necessary
import CpdaAdvance from "./pages/CPDA_ADVANCE";
import LTC from "./pages/LTC";
import Appraisal from "./pages/Appraisel";
import CpdaClaim from "./pages/CPDA_Claim";
import FormView from "./pages/FormView";
import Outbox from "./pages/Outbox";
// Removed CpdaAdvanceView import since it's replaced by GenericFormView
import LeaveFormView from "./pages/LeavePageComp/LeaveFormView";
import LeaveFilehandle from "./pages/LeavePageComp/Leave_file_handle";
import LeaveHandleResponsibility from "./pages/LeavePageComp/Leave_Handle_Responsibility";

import AdminLeaveManagement from "./pages/LeavePageComp/AdminLeaveManagement";

import OfflineLeaveForm from "./pages/LeavePageComp/OfflineLeaveForm";

import ViewEmployeeLB from "./pages/LeavePageComp/ViewEmployeeLB";
import AdminLeaveRequests from "./pages/LeavePageComp/AdminLeaveRequests";
// import UpdateLeaveBalance from "./pages/UpdateLeaveBalance";
import CPDAClaimFormView from "./pages/CPDA_ClaimPageComp/CPDAClaimFormView";
import GenericFormView from "./components/forms/GenericFormView";
import CPDAAdvanceFormView from "./pages/CPDA_ADVANCEPageComp/CPDAAdvanceFormView";
import LtcFormView from "./pages/LTCPageComp/LtcFormView";
import AppraisalFormView from "./pages/AppraisalPageComp/AppraisalFormView";
import * as api from "./services/api";

export default function HR() {
  return (
    <Routes>
      {/* Show welcome message at /hr */}
      <Route path="/" element={<HrDashboard />} />
      {/* Render LeavePage at /hr/leave */}
      <Route path="leave/file_handler/:id" element={<LeaveFilehandle />} />
      <Route path="leave/view/:id" element={<LeaveFormView />} />
      <Route
        path="leave/handle_responsibility/:id"
        element={<LeaveHandleResponsibility />}
      />
      <Route path="leave/*" element={<LeavePage />} />

      {/* Route for the CPDA Advance View page */}
      <Route path="cpda_adv/view/:id" element={<CPDAAdvanceFormView />} />
      <Route path="ltc/view/:id" element={<LtcFormView />} />
      <Route path="appraisal/view/:id" element={<AppraisalFormView />} />
      <Route path="cpda_claim/view/:id" element={<CPDAClaimFormView />} />

      <Route path="cpda_adv/*" element={<CpdaAdvance />} />
      <Route path="ltc/*" element={<LTC />} />
      <Route path="appraisal/*" element={<Appraisal />} />
      <Route path="cpda_claim/*" element={<CpdaClaim />} />
      <Route path="outbox/*" element={<Outbox />} />
      <Route path="FormView/*" element={<FormView />} />

      <Route
        path="admin_leave/view_employees_leave_balance/*"
        element={<ViewEmployeeLB />}
      />
      <Route
        path="admin_leave/review_leave_requests/*"
        element={<AdminLeaveRequests />}
      />

      <Route
        path="admin_leave/manage_offline_leave_form/*"
        element={<OfflineLeaveForm />}
      />
      <Route path="admin_leave/*" element={<AdminLeaveManagement />} />
    </Routes>
  );
}
