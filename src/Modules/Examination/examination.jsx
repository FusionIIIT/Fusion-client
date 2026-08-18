import { lazy, useMemo } from "react";
import { Route } from "react-router-dom";
import { useSelector } from "react-redux";

import { ModuleRoutes } from "../../ui/routing/ModuleRoutes";
import { pagesForRole } from "../../ui/nav/roles";
import ProtectedRoute from "./routes/protectedRoutes.jsx";
import { EXAMINATION_BASE, EXAMINATION_PAGES } from "./pages";

const COMPONENTS = {
  submitGradesProf: lazy(() => import("./submitGradesProf.jsx")),
  verifyGrades: lazy(() => import("./verifyGrades.jsx")),
  gradeValidation: lazy(() => import("./GradeValidation.jsx")),
  gradeStatus: lazy(() => import("./GradeStatus.jsx")),
  gradeSummary: lazy(() => import("./GradeSummary.jsx")),
  downloadGradesProf: lazy(() => import("./checkResultsProf.jsx")),
  verifyDean: lazy(() => import("./verifyDean.jsx")),
  validateDean: lazy(() => import("./validateDean.jsx")),
  checkResult: lazy(() => import("./checkResult.jsx")),
  announceResult: lazy(() => import("./AnnounceResult.jsx")),
  generateTranscript: lazy(() => import("./generateTranscript.jsx")),
};

const StudentTranscript = lazy(
  () => import("./components/studentTranscript.jsx"),
);
const PublishResultSelection = lazy(
  () => import("./PublishResultSelection.jsx"),
);

const DETAIL_ROUTES = [
  <Route
    key="transcript-detail"
    path="generate-transcript/:rollNumber"
    element={
      <ProtectedRoute roles={["acadadmin"]}>
        <StudentTranscript />
      </ProtectedRoute>
    }
  />,
  <Route
    key="publish-detail"
    path="result-announcement/:id/publish"
    element={
      <ProtectedRoute roles={["acadadmin", "Dean Academic"]}>
        <PublishResultSelection />
      </ProtectedRoute>
    }
  />,
];

export default function Examination() {
  const userRole = useSelector((state) => state.user.role);

  const pages = useMemo(
    () => pagesForRole(EXAMINATION_PAGES, userRole),
    [userRole],
  );

  if (userRole === undefined || userRole === null) return null;

  return (
    <ModuleRoutes
      pages={pages}
      components={COMPONENTS}
      extraRoutes={DETAIL_ROUTES}
      basePath={EXAMINATION_BASE}
      emptyMessage="No examination pages apply to your role."
    />
  );
}
