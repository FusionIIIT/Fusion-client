import { lazy, useMemo } from "react";
import { Center, Loader } from "@mantine/core";
import { useSelector } from "react-redux";

import { ModuleRoutes } from "../../ui/routing/ModuleRoutes";
import { pagesForRole } from "../../ui/nav/roles";
import { THESIS_BASE, THESIS_PAGES } from "./pages";

const COMPONENTS = {
  studentThesis: lazy(() => import("./StudentThesisPage")),
  studentThesisSubmissionPhd: lazy(
    () => import("./ThesisSubmission/StudentThesisSubmissionUploadForm"),
  ),
  studentThesisSubmissionPg: lazy(
    () => import("./ThesisSubmission/StudentPGThesisSubmissionUploadForm"),
  ),
  studentComprehensiveExam: lazy(
    () => import("./ComprehensiveExam/StudentComprehensiveExamPage"),
  ),
  studentProgressSeminar: lazy(() => import("./StudentSeminarPage")),
  studentOpenSeminar: lazy(
    () => import("./OpenSeminar/StudentOpenSeminarPage"),
  ),
  studentTeachingCredit: lazy(
    () => import("./TeachingCredit/StudentTeachingCreditPage"),
  ),

  supervisorDashboard: lazy(() => import("./SupervisorDashboard")),
  supervisorComprehensiveExam: lazy(
    () => import("./ComprehensiveExam/SupervisorComprehensiveExamDashboard"),
  ),
  supervisorThesisGrading: lazy(() => import("./SupervisorThesisGrading")),
  supervisorTeachingCredit: lazy(
    () => import("./TeachingCredit/SupervisorTeachingCreditList"),
  ),
  rpcDashboard: lazy(() => import("./RPCDashboardPage")),
  supervisorOpenSeminar: lazy(
    () => import("./OpenSeminar/SupervisorOpenSeminarDashboard"),
  ),
  deanNomineeReports: lazy(() => import("./OpenSeminar/DeanNomineeDashboard")),
  supervisorSubmissionPanel: lazy(
    () => import("./ThesisSubmission/SupervisorDashboardSub"),
  ),
  supervisorReviewReports: lazy(() => import("./SupervisorReviewReports")),

  hodDashboard: lazy(() => import("./HODDashboard")),
  hodComprehensiveExam: lazy(
    () => import("./ComprehensiveExam/HODComprehensiveExamDashboard"),
  ),
  hodOpenSeminar: lazy(() => import("./OpenSeminar/HODOpenSeminarDashboard")),
  hodTeachingCredit: lazy(
    () => import("./TeachingCredit/HODTeachingCreditDashboard"),
  ),
  hodExaminerPanel: lazy(() => import("./HODThesisExaminerPanel")),

  deanDashboard: lazy(() => import("./DeanDashboard")),
  deanComprehensiveExam: lazy(
    () => import("./ComprehensiveExam/DeanComprehensiveExamDashboard"),
  ),
  deanOpenSeminar: lazy(() => import("./OpenSeminar/DeanOpenSeminarDashboard")),
  deanPanelDashboard: lazy(
    () => import("./ThesisSubmission/DeanPanelDashboard"),
  ),
  deanPgExaminerPanel: lazy(() => import("./DeanPGThesisExaminerPanel")),

  directorDashboard: lazy(() => import("./ThesisSubmission/DirectorDashboard")),

  adminThesisGrades: lazy(() => import("./AdminThesisGrades")),
  adminComprehensiveEligibility: lazy(
    () => import("./ComprehensiveExam/AcademicOfficeComprehensiveExamList"),
  ),
  adminTeachingCredit: lazy(
    () => import("./TeachingCredit/AcademicOfficeTeachingCreditList"),
  ),
  adminHonorarium: lazy(() => import("./HonorariumDashboard")),
};

export default function ThesisResearchPage() {
  const role = useSelector((state) => state.user.role);
  const programmeType = useSelector((state) => state.user.programmeType);

  const pages = useMemo(
    () => pagesForRole(THESIS_PAGES, role, { programmeType }),
    [role, programmeType],
  );

  if (role === "student" && !programmeType) {
    return (
      <Center mt="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <ModuleRoutes
      pages={pages}
      components={COMPONENTS}
      basePath={THESIS_BASE}
      emptyMessage="No thesis or research-progress items apply to your role."
    />
  );
}
