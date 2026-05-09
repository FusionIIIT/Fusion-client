import React from "react";
import { Routes, Route } from "react-router-dom";
import LeaveFormView from "./LeavePageComp/LeaveFormView";
import LeaveInboxTrack from "./LeavePageComp/LeaveTrack";
import CpdaAdvanceTrack from "./CPDA_ADVANCEPageComp/Cpda_ADVANCETrack";
import CpdaClaimTrack from "./CPDA_ClaimPageComp/CPDA_ClaimTrack";
import AppraisalTrack from "./AppraisalPageComp/AppraisalTrack";
import LTCTrack from "./LTCPageComp/LTCTrack";
// import LTCFormView from './LTCFormView'; // Ensure the path is correct

function FormView() {
  return (
    <Routes>
      <Route path="leaveform" element={<LeaveFormView />} />
      <Route path="leaveform_track/:id" element={<LeaveInboxTrack />} />
      <Route path="cpda_adv_track/:id" element={<CpdaAdvanceTrack />} />
      <Route path="cpda_claim_track/:id" element={<CpdaClaimTrack />} />
      <Route path="ltc_track/:id" element={<LTCTrack />} />
      <Route path="appraisal_track/:id" element={<AppraisalTrack />} />

      {/* <Route path="/ltc" element={<LTCFormView />} /> */}
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default FormView;
