import { useEffect, useState, useMemo } from "react";
import { Flex, Center, Loader } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import CustomBreadcrumbs from "../../components/Breadcrumbs";
import ModuleTabs from "../../components/moduleTabs";
import RegisteredCourses from "./RegisteredCourses";
import AvailableCourses from "./AvailableCourses";
import PreRegistration from "./PreRegistration";
import FinalRegistration from "./FinalRegistration";
import StudentCourses from "./StudentCourses";
import DeletePreRegistration from "./DeletePreRegistration";
import AcademicCalendar from "./AcademicCalendar";
import GenerateStudentList from "./GenerateStudentList";
import ViewRollList from "./ViewRollList";
import AllocateCourses from "./AllocateCourses";
import VerifyStudentRegistration from "./VerifyStudentRegistration";
import SwayamRegistration from "./SwayamRegistrationWrapper";
import AllotCourses from "./AllotCourses";
import { setActiveTab_ } from "../../redux/moduleslice";
import { Faculty_TA_Dashboard } from "./Faculty_TA_Dashboard";
import StudentAddDropReplace from "./StudentAddDropReplace";
import AdminReplacementDashboard from "./AdminReplacementDashboard";
import StudentCalendar from "./StudentCalendar";
import AdminStudentDashboard from "./AdminStudentDashboard";
import AdminFeedbackView from "./FeedbackForm/AdminFeedbackView";
import AdminBatchChange from "./AdminBatchChange";
import AdminPromoteSemester from "./AdminPromoteSemester";
import InstructorDashboard from "./FeedbackForm/InstructorDashboard";
// PhD-specific imports
import StudentThesisPage from "./StudentThesisPage";
import SupervisorDashboard from "./SupervisorDashboard";
import DeanDashboard from "./DeanDashboard";
import HODDashboard from "./HODDashboard";
import StudentSeminarPage from "./StudentSeminarPage";
import RPCDashboardPage from "./RPCDashboardPage";
import StudentThesisSubmissionUploadForm from "./ThesisSubmission/StudentThesisSubmissionUploadForm";
import DirectorDashboard from "./ThesisSubmission/DirectorDashboard";
import DeanPanelDashboard from "./ThesisSubmission/DeanPanelDashboard";
import SupervisorDashboardSub from "./ThesisSubmission/SupervisorDashboardSub";
import AdminThesisEnrollments from "./AdminThesisEnrollments";
import AdminThesisGrades from "./AdminThesisGrades";
import SupervisorThesisGrading from "./SupervisorThesisGrading";
import { getProfileDataRoute } from "../../routes/dashboardRoutes";

function AcademicPage() {
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
          const programmeType = profileData?.programme_type || "UG";

          setStudentProgramme(programmeType);
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

  // Memoize tab configuration to avoid unnecessary recalculations
  const { tabItems, tabComponents } = useMemo(() => {
    if (role === "acadadmin" || role === "studentacadadmin") {
      return {
        tabItems: [
          { title: "Student Courses" },
          { title: "Delete Pre-Registration" },
          { title: "Academic Calendar" },
          { title: "Generate Student List" },
          { title: "Allocate Courses" },
          { title: "Verify Student Registration" },
          { title: "Allot Courses" },
          { title: "Replacement Allocation" },
          { title: "Student Dashboard" },
          { title: "Feedback Responses" },
          { title: "Batch/Branch Change" },
          { title: "Promote Students" },
          { title: "Thesis Enrollments" },
          { title: "Thesis Grades" },
        ],
        tabComponents: [
          StudentCourses,
          DeletePreRegistration,
          AcademicCalendar,
          GenerateStudentList,
          AllocateCourses,
          VerifyStudentRegistration,
          AllotCourses,
          AdminReplacementDashboard,
          AdminStudentDashboard,
          AdminFeedbackView,
          AdminBatchChange,
          AdminPromoteSemester,
          AdminThesisEnrollments,
          AdminThesisGrades,
        ],
      };
    }

    if (role === "student") {
      const isUG = studentProgramme === "UG";

      const baseTabs = [
        { title: "Registered Courses" },
        { title: "Available Courses" },
        { title: "Academic Calender" },
        { title: "Pre-Registration" },
        { title: "Final-Registration" },
        { title: "Swayam Registration" },
        { title: "Add / Drop" },
      ];

      const baseComponents = [
        RegisteredCourses,
        AvailableCourses,
        StudentCalendar,
        PreRegistration,
        FinalRegistration,
        SwayamRegistration,
        StudentAddDropReplace,
      ];

      if (isUG) {
        return { tabItems: baseTabs, tabComponents: baseComponents };
      }

      return {
        tabItems: [
          ...baseTabs,
          { title: "Thesis Registration" },
          { title: "Seminar" },
          { title: "Student Thesis Submission" },
        ],
        tabComponents: [
          ...baseComponents,
          StudentThesisPage,
          StudentSeminarPage,
          StudentThesisSubmissionUploadForm,
        ],
      };
    }

    if (role === "Dean Academic") {
      return {
        tabItems: [{ title: "Thesis" }, { title: "Thesis Submission Panel" }],
        tabComponents: [DeanDashboard, DeanPanelDashboard],
      };
    }

    if (role === "Director") {
      return {
        tabItems: [{ title: "Thesis Submission - Prioritize Panel" }],
        tabComponents: [DirectorDashboard],
      };
    }

    if (role && role.startsWith("HOD")) {
      return {
        tabItems: [{ title: "Thesis" }],
        tabComponents: [HODDashboard],
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
          { title: "View Roll List" },
          { title: "TA management" },
          { title: "Thesis Supervisor" },
          { title: "Thesis Grading" },
          { title: "Seminar" },
          { title: "Supervisor Thesis Examinar" },
          { title: "Course Feedback" },
        ],
        tabComponents: [
          ViewRollList,
          Faculty_TA_Dashboard,
          SupervisorDashboard,
          SupervisorThesisGrading,
          RPCDashboardPage,
          SupervisorDashboardSub,
          InstructorDashboard,
        ],
      };
    }

    return {
      tabItems: [{ title: "Registered Courses" }],
      tabComponents: [RegisteredCourses],
    };
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

export default AcademicPage;
