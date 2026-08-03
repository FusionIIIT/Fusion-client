import { useState, useEffect } from "react";
import { Flex } from "@mantine/core";
import { useSelector, useDispatch } from "react-redux";

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
import SwayamRegistration from "./SwayamRegistration";
import AllotCourses from "./AllotCourses";
import { setCurrentModule, setActiveTab_ } from "../../redux/moduleslice";

function AcademicPage() {
  const [activeTab, setActiveTab] = useState("0");
  const role = useSelector((state) => state.user.role);
  const dispatch = useDispatch();

  let tabItems;
  let tabComponents;

  if (role === "acadadmin" || role === "studentacadadmin") {
    tabItems = [
      { title: "Student Courses" },
      { title: "Delete Pre-Registration" },
      { title: "Academic Calendar" },
      { title: "Generate Student List" },
      { title: "Allocate Courses" },
      { title: "Verify Student Registration" },
      { title: "Allot Courses" },
    ];
    tabComponents = [
      StudentCourses,
      DeletePreRegistration,
      AcademicCalendar,
      GenerateStudentList,
      AllocateCourses,
      VerifyStudentRegistration,
      AllotCourses,
    ];
  } else if (role === "student") {
    tabItems = [
      { title: "Registered Courses" },
      { title: "Available Courses" },
      { title: "Pre-Registration" },
      { title: "Final-Registration" },
      { title: "Swayam Registration" },
    ];
    tabComponents = [
      RegisteredCourses,
      AvailableCourses,
      PreRegistration,
      FinalRegistration,
      SwayamRegistration,
    ];
  } else if (
    role === "faculty" ||
    role === "Associate Professor" ||
    role === "Assistant Professor" ||
    role === "Professor"
  ) {
    tabItems = [{ title: "View Roll List" }];
    tabComponents = [ViewRollList];
  } else {
    tabItems = [{ title: "Registered Courses" }];
    tabComponents = [RegisteredCourses];
  }

  const ActiveComponent = tabComponents[parseInt(activeTab, 10)];

  useEffect(() => {
    dispatch(setCurrentModule("Academics"));
  }, [dispatch]);

  useEffect(() => {
    if (tabItems && tabItems.length > 0) {
      const index = parseInt(activeTab, 10);
      const title = tabItems[index] ? tabItems[index].title : tabItems[0].title;
      dispatch(setActiveTab_(title));
    }
  }, [dispatch, activeTab, tabItems]);

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
