import { useEffect, useState, useMemo } from "react";
import { Flex, Center, Loader, Text } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import CustomBreadcrumbs from "../../components/Breadcrumbs";
import ModuleTabs from "../../components/moduleTabs";
import { setActiveTab_ } from "../../redux/moduleslice";
import { getProfileDataRoute } from "../../routes/dashboardRoutes";

import StudentThesisPage from "./StudentThesisPage";
import StudentSeminarPage from "./StudentSeminarPage";
import StudentThesisSubmissionUploadForm from "./ThesisSubmission/StudentThesisSubmissionUploadForm";
import StudentPGThesisSubmissionUploadForm from "./ThesisSubmission/StudentPGThesisSubmissionUploadForm";
import SupervisorDashboard from "./SupervisorDashboard";
import SupervisorThesisGrading from "./SupervisorThesisGrading";
import RPCDashboardPage from "./RPCDashboardPage";
import SupervisorDashboardSub from "./ThesisSubmission/SupervisorDashboardSub";
import SupervisorReviewReports from "./SupervisorReviewReports";
import HODDashboard from "./HODDashboard";
import DeanDashboard from "./DeanDashboard";
import DeanPanelDashboard from "./ThesisSubmission/DeanPanelDashboard";
import DirectorDashboard from "./ThesisSubmission/DirectorDashboard";
import AdminThesisGrades from "./AdminThesisGrades";
import HonorariumDashboard from "./HonorariumDashboard";
import StudentComprehensiveExamPage from "./ComprehensiveExam/StudentComprehensiveExamPage";
import SupervisorComprehensiveExamDashboard from "./ComprehensiveExam/SupervisorComprehensiveExamDashboard";
import HODComprehensiveExamDashboard from "./ComprehensiveExam/HODComprehensiveExamDashboard";
import DeanComprehensiveExamDashboard from "./ComprehensiveExam/DeanComprehensiveExamDashboard";
import AcademicOfficeComprehensiveExamList from "./ComprehensiveExam/AcademicOfficeComprehensiveExamList";
import StudentOpenSeminarPage from "./OpenSeminar/StudentOpenSeminarPage";
import SupervisorOpenSeminarDashboard from "./OpenSeminar/SupervisorOpenSeminarDashboard";
import DeanNomineeDashboard from "./OpenSeminar/DeanNomineeDashboard";
import HODOpenSeminarDashboard from "./OpenSeminar/HODOpenSeminarDashboard";
import DeanOpenSeminarDashboard from "./OpenSeminar/DeanOpenSeminarDashboard";
import StudentTeachingCreditPage from "./TeachingCredit/StudentTeachingCreditPage";
import SupervisorTeachingCreditList from "./TeachingCredit/SupervisorTeachingCreditList";
import HODTeachingCreditDashboard from "./TeachingCredit/HODTeachingCreditDashboard";
import AcademicOfficeTeachingCreditList from "./TeachingCredit/AcademicOfficeTeachingCreditList";
import HODThesisExaminerPanel from "./HODThesisExaminerPanel";
import DeanPGThesisExaminerPanel from "./DeanPGThesisExaminerPanel";

function ThesisResearchPage() {
  const [activeTab, setActiveTab] = useState("0");
  const [studentProgramme, setStudentProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchStudentProgramme = async () => {
      if (role === "student") {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            setStudentProgramme("UG");
            setLoading(false);
            return;
          }

          const response = await axios.get(getProfileDataRoute, {
            headers: { Authorization: `Token ${token}` },
          });

          const profileData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setStudentProgramme(profileData?.programme_type || "UG");
        } catch (error) {
          console.error("Error fetching student programme:", error);
          setStudentProgramme("UG");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchStudentProgramme();
  }, [role]);

  // Tabs follow the thesis pipeline stage (Topic -> Seminar -> Grading -> Final
  // Submission) in the same order for every role, instead of an ad hoc per-role list.
  const { tabItems, tabComponents } = useMemo(() => {
    if (role === "student" && studentProgramme && studentProgramme !== "UG") {
      // Final Submission (synopsis/report upload -> Dean Panel -> Director ->
      // external Indian+foreign examiners) is a PhD-specific workflow. PG
      // has its own separate, simpler submission step (no approval chain --
      // the supervisor scores decimal-mode theses inline in the regular
      // Thesis Grading tab, and the batch examiner in PG Examiner Panel).
      const isPhdStudent = studentProgramme === "PHD";
      const isPgStudent = studentProgramme === "PG";
      return {
        tabItems: [
          { title: "Thesis Supervisor Registration" },
          { title: "Comprehensive Examination" },
          { title: "Progress Seminar" },
          { title: "Open Seminar" },
          { title: "Teaching Credit" },
          ...(isPhdStudent ? [{ title: "Final Submission" }] : []),
          ...(isPgStudent ? [{ title: "Thesis Submission" }] : []),
        ],
        tabComponents: [
          StudentThesisPage,
          StudentComprehensiveExamPage,
          StudentSeminarPage,
          StudentOpenSeminarPage,
          StudentTeachingCreditPage,
          ...(isPhdStudent ? [StudentThesisSubmissionUploadForm] : []),
          ...(isPgStudent ? [StudentPGThesisSubmissionUploadForm] : []),
        ],
      };
    }

    if (
      role === "faculty" ||
      role === "Associate Professor" ||
      role === "Assistant Professor" ||
      role === "Professor"
    ) {
      return {
        tabItems: [
          { title: "Thesis Review" },
          { title: "Comprehensive Exam" },
          { title: "Thesis Grading" },
          { title: "RPC / Seminar Review" },
          { title: "Open Seminar" },
          { title: "Dean Nominee Reports" },
          { title: "Teaching Credit" },
          { title: "Examiner Assignment" },
          { title: "Examiner Reports" },
        ],
        tabComponents: [
          SupervisorDashboard,
          SupervisorComprehensiveExamDashboard,
          SupervisorThesisGrading,
          RPCDashboardPage,
          SupervisorOpenSeminarDashboard,
          DeanNomineeDashboard,
          SupervisorTeachingCreditList,
          SupervisorDashboardSub,
          SupervisorReviewReports,
        ],
      };
    }

    if (role && role.startsWith("HOD")) {
      return {
        tabItems: [
          { title: "Thesis Review" },
          { title: "Comprehensive Exam" },
          { title: "Open Seminar" },
          { title: "Teaching Credit" },
          { title: "PG Examiner Panel" },
        ],
        tabComponents: [
          HODDashboard,
          HODComprehensiveExamDashboard,
          HODOpenSeminarDashboard,
          HODTeachingCreditDashboard,
          HODThesisExaminerPanel,
        ],
      };
    }

    if (role === "Dean Academic") {
      return {
        tabItems: [
          { title: "Thesis Approval" },
          { title: "Comprehensive Exam" },
          { title: "Open Seminar" },
          { title: "Examiner Panel" },
          { title: "PG Examiner Panel" },
        ],
        tabComponents: [
          DeanDashboard,
          DeanComprehensiveExamDashboard,
          DeanOpenSeminarDashboard,
          DeanPanelDashboard,
          DeanPGThesisExaminerPanel,
        ],
      };
    }

    if (role === "Director") {
      return {
        tabItems: [{ title: "Examiner Prioritization" }],
        tabComponents: [DirectorDashboard],
      };
    }

    if (role === "acadadmin" || role === "studentacadadmin") {
      return {
        tabItems: [
          { title: "Thesis Grades" },
          { title: "Comprehensive Exam Eligibility" },
          { title: "Teaching Credit" },
          { title: "Examiner Honorarium" },
        ],
        tabComponents: [
          AdminThesisGrades,
          AcademicOfficeComprehensiveExamList,
          AcademicOfficeTeachingCreditList,
          HonorariumDashboard,
        ],
      };
    }

    return { tabItems: [], tabComponents: [] };
  }, [role, studentProgramme]);

  useEffect(() => {
    if (tabItems?.[activeTab]) {
      dispatch(setActiveTab_(tabItems[activeTab].title));
    }
  }, [activeTab, tabItems, dispatch]);

  const ActiveComponent = useMemo(
    () => tabComponents[parseInt(activeTab, 10)],
    [tabComponents, activeTab],
  );

  if (loading && role === "student") {
    return (
      <>
        <CustomBreadcrumbs />
        <Center mt="xl">
          <Loader />
        </Center>
      </>
    );
  }

  if (tabItems.length === 0) {
    return (
      <>
        <CustomBreadcrumbs />
        <Center mt="xl">
          <Text c="dimmed">
            No thesis or research-progress items apply to your role.
          </Text>
        </Center>
      </>
    );
  }

  return (
    <>
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Flex>
      <ActiveComponent mt="xl" />
    </>
  );
}

export default ThesisResearchPage;
