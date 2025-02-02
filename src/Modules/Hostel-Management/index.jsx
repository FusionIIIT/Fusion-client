import React from "react";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import SectionNavigationStudent from "./pages/SectionNavigationStudent";
import SectionNavigationAdmin from "./pages/SectionNavigationAdmin";
import SectionNavigationWarden from "./pages/SectionNavigationWarden";
import SectionNavigationCaretaker from "./pages/SectionNavigationCaretaker";
import { UploadAttendance2 } from "./pages/caretaker/UploadAttendancePage";

function HostelPage() {
  const userRole = useSelector((state) => state.user.role);
  const renderSectionNavigation = () => {
    // Check if the user is a caretaker
    if (userRole.toLowerCase().includes("caretaker")) {
      return <SectionNavigationCaretaker />;
    }

    // Check if the user is a warden
    if (userRole.toLowerCase().includes("warden")) {
      return <SectionNavigationWarden />;
    }

    // Role-based navigation
    switch (userRole.toLowerCase()) {
      case "student":
        return <SectionNavigationStudent />;
      case "admin":
        return <SectionNavigationAdmin />;
      default:
        return <div>No access</div>;
    }
  };

  return (
    <div>
      <CustomBreadcrumbs />
      <UploadAttendance2 />
      {renderSectionNavigation()}
    </div>
  );
}

export default HostelPage;
