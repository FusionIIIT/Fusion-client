import { lazy, useEffect, useMemo } from "react";
import { Center, Loader } from "@mantine/core";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ModuleRoutes } from "../../ui/routing/ModuleRoutes";
import { pagesForRole } from "../../ui/nav/roles";
import {
  ACADEMIC_BASE,
  ACADEMIC_NOTIFICATION_SLUGS,
  ACADEMIC_PAGES,
} from "./pages";

const COMPONENTS = {
  adminStudentCourses: lazy(() => import("./StudentCourses")),
  adminVerifyRegistration: lazy(() => import("./VerifyStudentRegistration")),
  adminDeletePreRegistration: lazy(() => import("./DeletePreRegistration")),
  adminAllotCourses: lazy(() => import("./AllotCourses")),
  adminAllocateCourses: lazy(() => import("./AllocateCourses")),
  adminPreRegistrationReport: lazy(() => import("./PreRegistrationReport")),
  adminAddCourses: lazy(() => import("./AdminAddDashboard")),
  adminDropCourses: lazy(() => import("./AdminDropDashboard")),
  adminReplacement: lazy(() => import("./AdminReplacementDashboard")),
  adminSwayam: lazy(() => import("./AdminSwayamDashboard")),
  adminStudentDashboard: lazy(() => import("./AdminStudentDashboard")),
  adminGenerateStudentList: lazy(() => import("./GenerateStudentList")),
  adminSectionAssignment: lazy(() => import("./SectionAssignment")),
  adminBatchChange: lazy(() => import("./AdminBatchChange")),
  adminPromoteSemester: lazy(() => import("./AdminPromoteSemester")),
  adminStudentStatus: lazy(() => import("./AdminStudentStatus")),
  adminAcademicCalendar: lazy(() => import("./AcademicCalendar")),
  adminFeedbackView: lazy(() => import("./FeedbackForm/AdminFeedbackView")),
  adminPhdCourseRequests: lazy(() => import("./AdminPhDCourseRequests")),

  studentAlumniHome: lazy(() => import("./AlumniHome")),
  studentWithdrawnHome: lazy(() => import("./AlumniHome")),
  studentRegisteredCourses: lazy(() => import("./RegisteredCourses")),
  studentAvailableCourses: lazy(() => import("./AvailableCourses")),
  studentPreRegistration: lazy(() => import("./PreRegistration")),
  studentFinalRegistration: lazy(() => import("./FinalRegistration")),
  studentPhdCourseRegistration: lazy(() => import("./PhDCourseRegistration")),
  studentSwayam: lazy(() => import("./SwayamRegistrationWrapper")),
  studentAddDrop: lazy(() => import("./StudentAddDropReplace")),
  studentCalendar: lazy(() => import("./StudentCalendar")),
  studentFeedbackForm: lazy(
    () => import("./FeedbackForm/StudentCourseFeedbackForm"),
  ),
  studentTeachingCreditFeedback: lazy(() => import("./TeachingCreditFeedback")),

  adminFeeStructure: lazy(() => import("./FeeStructure")),
  facultyRollList: lazy(() => import("./ViewRollList")),
  facultyTaDashboard: lazy(() =>
    import("./Faculty_TA_Dashboard").then((m) => ({
      default: m.Faculty_TA_Dashboard,
    })),
  ),
  facultyCourseFeedback: lazy(
    () => import("./FeedbackForm/InstructorDashboard"),
  ),
};

export default function AcademicPage() {
  const role = useSelector((state) => state.user.role);
  const programmeType = useSelector((state) => state.user.programmeType);
  const studentStatus = useSelector((state) => state.user.studentStatus);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pages = useMemo(
    () => pagesForRole(ACADEMIC_PAGES, role, { programmeType, studentStatus }),
    [role, programmeType, studentStatus],
  );

  // A student's PG/PhD pages exist only once programmeType has loaded, which
  // happens after the page opens (always on a fresh load). Until then, wait:
  // otherwise a PG/PhD address is replaced with a UG page and lost.
  const waitingForProgramme = role === "student" && !programmeType;

  const requestedTab = searchParams.get("tab");
  useEffect(() => {
    if (!requestedTab || waitingForProgramme) return;
    const candidates = ACADEMIC_NOTIFICATION_SLUGS[requestedTab] ?? [];
    const target =
      pages.find((p) => candidates.includes(p.slug)) ??
      pages.find((p) => p.title.toLowerCase() === requestedTab.toLowerCase());
    if (target) navigate(`/academics/${target.slug}`, { replace: true });
  }, [requestedTab, pages, navigate, waitingForProgramme]);

  if (waitingForProgramme) {
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
      basePath={ACADEMIC_BASE}
      emptyMessage="No academic pages apply to your role."
    />
  );
}
