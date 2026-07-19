import { useEffect, useState, useMemo } from "react";
import { Flex } from "@mantine/core";
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
import SectionAssignment from "./SectionAssignment";
import ViewRollList from "./ViewRollList";
import AllocateCourses from "./AllocateCourses";
import VerifyStudentRegistration from "./VerifyStudentRegistration";
import SwayamRegistration from "./SwayamRegistrationWrapper";
import AllotCourses from "./AllotCourses";
import { setActiveTab_ } from "../../redux/moduleslice";
import { Faculty_TA_Dashboard } from "./Faculty_TA_Dashboard";
import StudentAddDropReplace from "./StudentAddDropReplace";
import AdminReplacementDashboard from "./AdminReplacementDashboard";
import AdminDropDashboard from "./AdminDropDashboard";
import AdminAddDashboard from "./AdminAddDashboard";
import StudentCalendar from "./StudentCalendar";
import AdminStudentDashboard from "./AdminStudentDashboard";
import StudentCourseFeedbackForm from "./FeedbackForm/StudentCourseFeedbackForm";
import AdminFeedbackView from "./FeedbackForm/AdminFeedbackView";
import AdminBatchChange from "./AdminBatchChange";
import AdminPromoteSemester from "./AdminPromoteSemester";
import InstructorDashboard from "./FeedbackForm/InstructorDashboard";
import AdminSwayamDashboard from "./AdminSwayamDashboard";
import PhDCourseRegistration from "./PhDCourseRegistration";
import AdminPhDCourseRequests from "./AdminPhDCourseRequests";
import TeachingCreditFeedback from "./TeachingCreditFeedback";
import { phdStudentStatusRoute } from "../../routes/academicRoutes";

function AcademicPage() {
  const [activeTab, setActiveTab] = useState("0");
  const [isPhdStudent, setIsPhdStudent] = useState(false);
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  // Only PhD students get the "PhD Course Registration" tab; check once so
  // the tab list doesn't have to show/hide after an initial flash.
  useEffect(() => {
    if (role !== "student") return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios
      .get(phdStudentStatusRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => setIsPhdStudent(Boolean(data?.is_phd)))
      .catch(() => setIsPhdStudent(false));
  }, [role]);

  // Memoize tab configuration to avoid unnecessary recalculations.
  // PhD thesis/seminar UI lives in the ThesisResearch module (/thesis-research),
  // so the Academic module is course-registration only.
  const { tabItems, tabComponents } = useMemo(() => {
    if (role === "acadadmin" || role === "studentacadadmin") {
      return {
        tabItems: [
          { title: "Student Courses" },
          { title: "Delete Pre-Registration" },
          { title: "Academic Calendar" },
          { title: "Generate Student List" },
          { title: "Section Assignment" },
          { title: "Allocate Courses" },
          { title: "Verify Student Registration" },
          { title: "Allot Courses" },
          { title: "Replacement Allocation" },
          { title: "Add BL Courses" },
          { title: "Drop Courses" },
          { title: "Swayam" },
          { title: "Student Dashboard" },
          { title: "Feedback Responses" },
          { title: "Batch/Branch Change" },
          { title: "Promote Students" },
          { title: "PhD Course Requests" },
        ],
        tabComponents: [
          StudentCourses,
          DeletePreRegistration,
          AcademicCalendar,
          GenerateStudentList,
          SectionAssignment,
          AllocateCourses,
          VerifyStudentRegistration,
          AllotCourses,
          AdminReplacementDashboard,
          AdminAddDashboard,
          AdminDropDashboard,
          AdminSwayamDashboard,
          AdminStudentDashboard,
          AdminFeedbackView,
          AdminBatchChange,
          AdminPromoteSemester,
          AdminPhDCourseRequests,
        ],
      };
    }

    if (role === "student") {
      return {
        tabItems: [
          { title: "Registered Courses" },
          { title: "Available Courses" },
          { title: "Academic Calender" },
          { title: "Pre-Registration" },
          { title: "Final-Registration" },
          { title: "Swayam" },
          { title: "Add / Drop" },
          { title: "Feedback Form" },
          { title: "Teaching Credit Feedback" },
          ...(isPhdStudent ? [{ title: "PhD Course Registration" }] : []),
        ],
        tabComponents: [
          RegisteredCourses,
          AvailableCourses,
          StudentCalendar,
          PreRegistration,
          FinalRegistration,
          SwayamRegistration,
          StudentAddDropReplace,
          StudentCourseFeedbackForm,
          TeachingCreditFeedback,
          ...(isPhdStudent ? [PhDCourseRegistration] : []),
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
          { title: "View Roll List" },
          { title: "TA management" },
          { title: "Course Feedback" },
        ],
        tabComponents: [
          ViewRollList,
          Faculty_TA_Dashboard,
          InstructorDashboard,
        ],
      };
    }

    return {
      tabItems: [{ title: "Registered Courses" }],
      tabComponents: [RegisteredCourses],
    };
  }, [role, isPhdStudent]);

  useEffect(() => {
    if (tabItems?.[activeTab]) {
      dispatch(setActiveTab_(tabItems[activeTab].title));
    }
  }, [activeTab, tabItems, dispatch]);

  const ActiveComponent = useMemo(
    () => tabComponents[parseInt(activeTab, 10)],
    [tabComponents, activeTab],
  );

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
