import { useState } from "react";
import { Container } from "@mantine/core";
import ModuleTabs from "../../../../components/moduleTabs";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import CreateCourse from "./CreateCourse";
import UploadMaterial from "./UploadMaterial";
import CreateAssignment from "./CreateAssignment";
import GradeSubmissions from "./GradeSubmissions";

const tabItems = [
  { title: "Create Course" },
  { title: "Upload Material" },
  { title: "Create Assignment" },
  { title: "Grade Submissions" },
];

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("0");

  const safeIndex = (() => {
    const parsed = Number.parseInt(activeTab, 10);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), tabItems.length - 1);
  })();

  const renderTab = () => {
    switch (tabItems[safeIndex].title) {
      case "Create Course":
        return <CreateCourse />;
      case "Upload Material":
        return <UploadMaterial />;
      case "Create Assignment":
        return <CreateAssignment />;
      case "Grade Submissions":
        return <GradeSubmissions />;
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
