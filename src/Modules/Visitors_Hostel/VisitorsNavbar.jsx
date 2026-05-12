import React from "react";
import { Tabs, MantineProvider, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "./components/BreadCrumbs"; // Import the CustomBreadcrumbs component
import { VH_ABSOLUTE_PATHS } from "../../routes/visitorsHostelRoutes";

const TabsModules = [
  {
    label: "Manage Bookings",
    id: "manage-bookings",
    url: VH_ABSOLUTE_PATHS.ROOT,
  },
  {
    label: "Room Availability",
    id: "room-availability",
    url: VH_ABSOLUTE_PATHS.ROOM_AVAILABILITY,
  },
  { label: "Inventory", id: "inventory", url: VH_ABSOLUTE_PATHS.INVENTORY },
  {
    label: "Account Statement",
    id: "account-statement",
    url: VH_ABSOLUTE_PATHS.ACCOUNT_STATEMENTS,
  },
  {
    label: "Rules and Regulations",
    id: "rules",
    url: VH_ABSOLUTE_PATHS.GUIDELINES,
  },
];

const ManageBookingsTabs = [
  {
    label: "Bookings",
    id: "bookings",
    url: VH_ABSOLUTE_PATHS.BOOKINGS,
  },
  {
    label: "Pending Requests",
    id: "pending-requests",
    url: VH_ABSOLUTE_PATHS.PENDING_BOOKINGS,
  },
  {
    label: "Cancelled Requests",
    id: "cancel-request",
    url: VH_ABSOLUTE_PATHS.CANCELLED_BOOKINGS,
  },
  {
    label: "Active Bookings",
    id: "active-bookings",
    url: VH_ABSOLUTE_PATHS.ACTIVE_BOOKINGS,
  },
  {
    label: "Completed Bookings",
    id: "completed-bookings",
    url: VH_ABSOLUTE_PATHS.COMPLETED_BOOKINGS,
  },
];

export default function BookingManagement() {
  const [activeTab, setActiveTab] = React.useState("manage-bookings");
  const [activeSubTab, setActiveSubTab] = React.useState("bookings");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const path = location.pathname;

    if (
      path.includes(VH_ABSOLUTE_PATHS.ROOM_AVAILABILITY) ||
      path.includes(VH_ABSOLUTE_PATHS.INVENTORY) ||
      path.includes(VH_ABSOLUTE_PATHS.ACCOUNT_STATEMENTS) ||
      path.includes(VH_ABSOLUTE_PATHS.GUIDELINES)
    ) {
      if (path.includes(VH_ABSOLUTE_PATHS.ROOM_AVAILABILITY)) setActiveTab("room-availability");
      else if (path.includes(VH_ABSOLUTE_PATHS.INVENTORY)) setActiveTab("inventory");
      else if (path.includes(VH_ABSOLUTE_PATHS.ACCOUNT_STATEMENTS)) setActiveTab("account-statement");
      else if (path.includes(VH_ABSOLUTE_PATHS.GUIDELINES)) setActiveTab("rules");
      return;
    }

    setActiveTab("manage-bookings");

    if (path.includes(VH_ABSOLUTE_PATHS.PENDING_BOOKINGS)) setActiveSubTab("pending-requests");
    else if (path.includes(VH_ABSOLUTE_PATHS.CANCELLED_BOOKINGS)) setActiveSubTab("cancel-request");
    else if (path.includes(VH_ABSOLUTE_PATHS.ACTIVE_BOOKINGS)) setActiveSubTab("active-bookings");
    else if (path.includes(VH_ABSOLUTE_PATHS.COMPLETED_BOOKINGS)) setActiveSubTab("completed-bookings");
    else setActiveSubTab("bookings");
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    const tab = TabsModules.find((t) => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      navigate(tab.url);
    }
  };

  const handleSubTabChange = (tabId) => {
    const tab = ManageBookingsTabs.find((t) => t.id === tabId);
    if (tab) {
      setActiveSubTab(tabId);
      navigate(tab.url);
    }
  };

  const role = useSelector((state) => state.user.role);
  const currentAccessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules
  );
  const isIncharge = role === "VhIncharge";
  const isCaretaker = role === "VhCaretaker";
  
  // Check if user has access to visitor_hostel module
  const hasVHAccess = currentAccessibleModules?.visitor_hostel === true;

  const filteredTabs = TabsModules.filter((tab) => {
    // VhIncharge has full module access.
    if (isIncharge) {
      return true;
    }
    // VhCaretaker cannot access financial reports.
    if (isCaretaker) {
      return tab.id !== "account-statement";
    }
    // Other users see tabs only if they have visitor_hostel module access
    if (hasVHAccess) {
      return ["manage-bookings", "booking-form", "rules"].includes(tab.id);
    }
    // If no access, show nothing
    return false;
  });

  const activeTabLabel =
    TabsModules.find((tab) => tab.id === activeTab)?.label || "Manage Bookings";
  const activeSubTabLabel =
    ManageBookingsTabs.find((tab) => tab.id === activeSubTab)?.label || "Bookings";

  const activeTabIndex = filteredTabs.findIndex((tab) => tab.id === activeTab);
  const activeSubTabIndex = ManageBookingsTabs.findIndex(
    (tab) => tab.id === activeSubTab,
  );

  const handleNextTab = () => {
    if (activeTabIndex < filteredTabs.length - 1) {
      const nextTab = filteredTabs[activeTabIndex + 1];
      handleTabChange(nextTab.id);
    }
  };

  const handlePreviousTab = () => {
    if (activeTabIndex > 0) {
      const prevTab = filteredTabs[activeTabIndex - 1];
      handleTabChange(prevTab.id);
    }
  };

  const handleNextSubTab = () => {
    if (activeSubTabIndex < ManageBookingsTabs.length - 1) {
      const nextTab = ManageBookingsTabs[activeSubTabIndex + 1];
      handleSubTabChange(nextTab.id);
    }
  };

  const handlePreviousSubTab = () => {
    if (activeSubTabIndex > 0) {
      const prevTab = ManageBookingsTabs[activeSubTabIndex - 1];
      handleSubTabChange(prevTab.id);
    }
  };

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <CustomBreadcrumbs
        activeTab={activeTabLabel}
        subTab={activeTab === "manage-bookings" ? activeSubTabLabel : ""}
      />
      <div className="booking-management">
        {/* Main Tab Navigation */}
        <div className="tabs-navigation">
          <Button
            variant="subtle"
            size="xs"
            onClick={handlePreviousTab}
            disabled={activeTabIndex === 0}
            className="toggle-button"
          >
            <IconChevronLeft size={18} />
          </Button>
          <div className="tabs-scrollable-container">
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tabs.List className="responsive-tabs">
                {filteredTabs.map((tab) => (
                  <Tabs.Tab
                    key={tab.id}
                    value={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    sx={() => ({
                      fontWeight: activeTab === tab.id ? "bold" : "normal",
                      maxWidth: "120px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    })}
                  >
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>
          <Button
            variant="subtle"
            size="xs"
            onClick={handleNextTab}
            disabled={activeTabIndex === filteredTabs.length - 1}
            className="toggle-button"
          >
            <IconChevronRight size={18} />
          </Button>
        </div>
        {/* SubTab Navigation */}
        {activeTab === "manage-bookings" && (
          <div className="tabs-container">
            <div className="tabs-navigation">
              <Button
                variant="subtle"
                size="xs"
                onClick={handlePreviousSubTab}
                disabled={activeSubTabIndex === 0}
                className="toggle-button"
              >
                <IconChevronLeft size={18} />
              </Button>
              <div className="tabs-scrollable-container">
                <Tabs value={activeSubTab} onChange={handleSubTabChange}>
                  <Tabs.List className="responsive-tabs">
                    {ManageBookingsTabs.filter((tab) => {
                      // Pending Requests only for VhIncharge/VhCaretaker
                      if (tab.id === "pending-requests") {
                        return role === "VhIncharge" || role === "VhCaretaker";
                      }
                      // All other tabs visible to everyone
                      return true;
                    }).map((tab) => (
                      <Tabs.Tab
                        key={tab.id}
                        value={tab.id}
                        onClick={() => handleSubTabChange(tab.id)}
                        sx={() => ({
                          fontWeight:
                            activeSubTab === tab.id ? "bold" : "normal",
                          maxWidth: "120px",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {tab.label}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs>
              </div>
              <Button
                variant="subtle"
                size="xs"
                onClick={handleNextSubTab}
                disabled={activeSubTabIndex === ManageBookingsTabs.length - 1}
                className="toggle-button"
              >
                <IconChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .booking-management {
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .tabs-navigation {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .tabs-scrollable-container {
          flex-grow: 1;
          overflow-x: auto; /* Allow horizontal scrolling for the tabs */
          overflow-y: hidden; /* Prevent vertical scrolling */
          white-space: nowrap; /* Ensure tabs stay on one line */
        }
        .responsive-tabs {
          display: inline-flex;
          gap: 10px;
        }
        .tabs-container {
          max-width: 100%; /* Ensure content fits within the parent container */
          overflow: hidden;
        }
        .toggle-button {
          width: 40px; /* Fixed width */
          height: 40px; /* Fixed height */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0; /* Remove extra padding */
        }
        @media (max-width: 768px) {
          .tabs-scrollable-container {
            overflow-x: hidden; /* Allow scrolling on smaller screens */
          }
        }
      `}</style>
    </MantineProvider>
  );
}
