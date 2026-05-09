import React from "react";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import SectionNavigationStudent from "./pages/SectionNavigationStudent";
import SectionNavigationAdmin from "./pages/SectionNavigationAdmin";
import SectionNavigationWarden from "./pages/SectionNavigationWarden";
import SectionNavigationCaretaker from "./pages/SectionNavigationCaretaker";

function HostelPage() {
  const userRole = useSelector((state) => state.user.role);

  const normalizeRole = (role) =>
    String(role || "")
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, "");

  const renderSectionNavigation = () => {
    const normalizedRole = normalizeRole(userRole);

    // Check if the user is a caretaker
    if (normalizedRole.includes("caretaker")) {
      return <SectionNavigationCaretaker />;
    }

    // Check if the user is a warden.
    // Support common spelling variants from role data (e.g., wrden/wardn).
    if (
      normalizedRole.includes("warden") ||
      normalizedRole.includes("wrden") ||
      normalizedRole.includes("wardn")
    ) {
      return <SectionNavigationWarden />;
    }

    if (normalizedRole.includes("admin")) {
      return <SectionNavigationAdmin />;
    }

    // Role-based navigation
    switch (normalizedRole) {
      case "student":
        return <SectionNavigationStudent />;
      case "hostel_admin":
      case "hosteladmin":
        return <SectionNavigationAdmin />;
      case "guestuser":
        return <div>Loading role...</div>;
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
