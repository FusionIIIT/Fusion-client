import { useEffect, useState, useMemo } from "react";
import { Flex } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";

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
import AdminAddDashboard from "./AdminAddDashboard";
import AdminDropDashboard from "./AdminDropDashboard";
import AdminSwayamDashboard from "./AdminSwayamDashboard";
import StudentCalendar from "./StudentCalendar";
import AdminStudentDashboard from "./AdminStudentDashboard";
import AdminFeedbackView from "./FeedbackForm/AdminFeedbackView";
import StudentCourseFeedbackForm from "./FeedbackForm/StudentCourseFeedbackForm";
import AdminBatchChange from "./AdminBatchChange";
import AdminPromoteSemester from "./AdminPromoteSemester";
import InstructorDashboard from "./FeedbackForm/InstructorDashboard";

function AcademicPage() {
  const [activeTab, setActiveTab] = useState("0");
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  // Memoize tab configuration to avoid unnecessary recalculations
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
          { title: "Swayam Registration" },
          { title: "Add / Drop" },
          { title: "Feedback Form" },
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
  }, [role]);

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
