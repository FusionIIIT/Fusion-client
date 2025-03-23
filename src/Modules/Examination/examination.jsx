import { Routes, Route, Navigate } from "react-router-dom";
import SubmitGrades from "./submitGrades.jsx";
import VerifyGrades from "./verifyGrades.jsx";
import GenerateTranscript from "./generateTranscript.jsx";
import Nav from "./components/nav2.jsx";
import { Layout } from "../../components/layout.jsx";
import StudentTranscript from "./components/studentTranscript.jsx";
import Announcement from "./announcement.jsx";
import VerifyDean from "./verifyDean.jsx";
import ValidateDean from "./validateDean.jsx";
import CheckResult from "./checkResult.jsx";
import CustomBreadExam from "./components/customBreadCrumbs.jsx";
import SubmitGradesProf from "./submitGradesProf.jsx";

export default function Examination() {
  return (
    <div>
      <Layout>
        <CustomBreadExam />
        <Nav />
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/examination/submit-grades" replace />}
          />
          <Route path="/submit-grades" element={<SubmitGrades />} />
          <Route path="/verify-grades" element={<VerifyGrades />} />
          <Route path="/update" element={<VerifyDean />} />
          <Route path="/validate" element={<ValidateDean />} />
          <Route path="/result" element={<CheckResult />} />
          <Route path="/generate-transcript" element={<GenerateTranscript />} />
          <Route
            path="/generate-transcript/:rollNumber"
            element={<StudentTranscript />}
          />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/submit-grades-prof" element={<SubmitGradesProf />} />
        </Routes>
      </Layout>
    </div>
  );
}
