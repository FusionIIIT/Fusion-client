import { useState } from "react";
import { Container } from "@mantine/core";
import ModuleTabs from "../../../../components/moduleTabs";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import CourseCatalog from "./CourseCatalog";
import MyEnrollments from "./MyEnrollments";
import SubmitAssignment from "./SubmitAssignment";

const tabItems = [
  { title: "Course Catalog" },
  { title: "My Enrollments" },
  { title: "Submit Assignment" },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("0");

  const safeIndex = (() => {
    const parsed = Number.parseInt(activeTab, 10);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), tabItems.length - 1);
  })();

  const renderTab = () => {
    switch (tabItems[safeIndex].title) {
      case "Course Catalog":
        return <CourseCatalog />;
      case "My Enrollments":
        return <MyEnrollments />;
      case "Submit Assignment":
        return <SubmitAssignment />;
      default:
        return null;
    }
  };

  return (
    <Container fluid>
      <CustomBreadcrumbs />
      <ModuleTabs
        tabs={tabItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        badges={new Array(tabItems.length).fill(0)}
      />
      {renderTab()}
    </Container>
  );
}
