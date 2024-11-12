import React from "react";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import SectionNavigationStudent from "./pages/SectionNavigationStudent";
import SectionNavigationAdmin from "./pages/SectionNavigationAdmin";
import SectionNavigationWarden from "./pages/SectionNavigationWarden";
import SectionNavigationCaretaker from "./pages/SectionNavigationCaretaker";

function HostelPage() {
  const userRole = useSelector((state) => state.user.role);
  const renderSectionNavigation = () => {
    switch (userRole) {
      case "student":
        return <SectionNavigationStudent />;
      case "admin":
        return <SectionNavigationAdmin />;
      case "warden":
        return <SectionNavigationWarden />;
      case "caretaker":
        return <SectionNavigationCaretaker />;
      default:
        return <div>No access</div>;
    }
  };

  return (
    <div>
      <CustomBreadcrumbs />
      {renderSectionNavigation()}
    </div>
  );
}

export default HostelPage;
