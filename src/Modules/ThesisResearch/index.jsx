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
import SupervisorDashboard from "./SupervisorDashboard";
import SupervisorThesisGrading from "./SupervisorThesisGrading";
import RPCDashboardPage from "./RPCDashboardPage";
import SupervisorDashboardSub from "./ThesisSubmission/SupervisorDashboardSub";
import HODDashboard from "./HODDashboard";
import DeanDashboard from "./DeanDashboard";
import DeanPanelDashboard from "./ThesisSubmission/DeanPanelDashboard";
import DirectorDashboard from "./ThesisSubmission/DirectorDashboard";
import AdminThesisGrades from "./AdminThesisGrades";
import StudentComprehensiveExamPage from "./ComprehensiveExam/StudentComprehensiveExamPage";
import SupervisorComprehensiveExamDashboard from "./ComprehensiveExam/SupervisorComprehensiveExamDashboard";
import HODComprehensiveExamDashboard from "./ComprehensiveExam/HODComprehensiveExamDashboard";
import ConvenerComprehensiveExamDashboard from "./ComprehensiveExam/ConvenerComprehensiveExamDashboard";
import AcademicOfficeComprehensiveExamList from "./ComprehensiveExam/AcademicOfficeComprehensiveExamList";
import StudentOpenSeminarPage from "./OpenSeminar/StudentOpenSeminarPage";
import SupervisorOpenSeminarDashboard from "./OpenSeminar/SupervisorOpenSeminarDashboard";
import DeanNomineeDashboard from "./OpenSeminar/DeanNomineeDashboard";
import ConvenerOpenSeminarDashboard from "./OpenSeminar/ConvenerOpenSeminarDashboard";
import StudentTeachingCreditPage from "./TeachingCredit/StudentTeachingCreditPage";
import SupervisorTeachingCreditList from "./TeachingCredit/SupervisorTeachingCreditList";
import HODTeachingCreditDashboard from "./TeachingCredit/HODTeachingCreditDashboard";
import AcademicOfficeTeachingCreditList from "./TeachingCredit/AcademicOfficeTeachingCreditList";

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
      return {
        tabItems: [
          { title: "Thesis Supervisor Registration" },
          { title: "Comprehensive Examination" },
          { title: "Progress Seminar" },
          { title: "Open Seminar" },
          { title: "Teaching Credit" },
          { title: "Final Submission" },
        ],
        tabComponents: [
          StudentThesisPage,
          StudentComprehensiveExamPage,
          StudentSeminarPage,
          StudentOpenSeminarPage,
          StudentTeachingCreditPage,
          StudentThesisSubmissionUploadForm,
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
        ],
      };
    }

    if (role && role.startsWith("HOD")) {
      return {
        tabItems: [
          { title: "Thesis Review" },
          { title: "Comprehensive Exam Subjects" },
          { title: "Teaching Credit" },
        ],
        tabComponents: [
          HODDashboard,
          HODComprehensiveExamDashboard,
          HODTeachingCreditDashboard,
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
        ],
        tabComponents: [
          DeanDashboard,
          ConvenerComprehensiveExamDashboard,
          ConvenerOpenSeminarDashboard,
          DeanPanelDashboard,
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
        ],
        tabComponents: [
          AdminThesisGrades,
          AcademicOfficeComprehensiveExamList,
          AcademicOfficeTeachingCreditList,
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
