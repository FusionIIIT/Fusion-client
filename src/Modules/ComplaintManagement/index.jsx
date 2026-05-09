import { lazy, Suspense, useRef, useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Flex, Loader, Tabs, Text } from "@mantine/core";
import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import { getComplaintUserRole } from "./routes/api";
import classes from "./ComplaintModule.module.css";

// Lazy load components
const Feedback = lazy(() => import("./components/Feedback"));
const FormPage = lazy(() => import("./components/FormPage"));
const ComplaintHistory = lazy(() => import("./components/ComplaintHistory"));
const GenerateReport = lazy(() => import("./components/Generate_Report"));
const SupervisorDashboard = lazy(() => import("./components/SupervisorDashboard"));
const CaretakerQueue = lazy(
  () => import("./components/UnresolvedComplaints"),
);
const RedirectedComplaints = lazy(
  () => import("./components/RedirectedComplaints"),
);
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

// Initialize font
(() => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
})();

// Define role-based tab configurations
const TAB_CONFIGS = {
  supervisor: [{ title: "Dashboard" }, { title: "Generate Report" }],
  report: [{ title: "Generate Report" }],
  staff: [
    // Single queue with status filters including resolved/escalated/declined
    { title: "Dashboard" },
  ],
  sp: [{ title: "Redirected Complaints" }, { title: "Generate Report" }],
  complaint_admin: [{ title: "Admin Dashboard" }, { title: "Generate Report" }],
  default: [
    { title: "Lodge a Complaint" },
    { title: "Complaint History" },
    { title: "Feedback" },
  ],
};
function NavigationButton({ direction, onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      p={0}
      style={{ border: "none" }}
    >
      {direction === "prev" ? (
        <CaretCircleLeft
          className={classes.fusionCaretCircleIcon}
          weight="light"
          aria-label="Previous"
        />
      ) : (
        <CaretCircleRight
          className={classes.fusionCaretCircleIcon}
          weight="light"
          aria-label="Next"
        />
      )}
    </Button>
  );
}

NavigationButton.propTypes = {
  direction: PropTypes.oneOf(["prev", "next"]).isRequired,
  onClick: PropTypes.func.isRequired,
};

function ComplaintModuleLayout() {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);
  const role = useSelector((state) => state.user.role);
  const [complaintRole, setComplaintRole] = useState("");
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchComplaintRole = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        if (isMounted) setIsRoleLoading(false);
        return;
      }

      const response = await getComplaintUserRole(token);
      if (isMounted) {
        setComplaintRole(response.success ? response.data?.user_type || "" : "");
        setIsRoleLoading(false);
      }
    };

    fetchComplaintRole();
    return () => {
      isMounted = false;
    };
  }, []);

  // Prefer the selected dashboard role (designation) over generic user_type
  // from /complaint/, because values like "staff" are too broad for routing.
  const effectiveRole = role || complaintRole;

  const isComplaintAdminRole =
    effectiveRole.includes("complaint_admin") ||
    effectiveRole.includes("service_authority");
  const isSupervisorRole = effectiveRole.includes("supervisor");
  const isReportRole = effectiveRole.includes("warden");
  const isServiceProviderRole = effectiveRole.includes("service_provider");
  const isStaffQueueRole =
    effectiveRole.includes("caretaker") || effectiveRole.includes("convener");

  // Choose the tab configuration based on user role.
  const tabItems = useMemo(() => {
    if (isComplaintAdminRole) return TAB_CONFIGS.complaint_admin;
    if (isSupervisorRole) return TAB_CONFIGS.supervisor;
    if (isReportRole) return TAB_CONFIGS.report;
    if (isServiceProviderRole) return TAB_CONFIGS.sp;
    if (isStaffQueueRole) return TAB_CONFIGS.staff;
    return TAB_CONFIGS.default;
  }, [isComplaintAdminRole, isSupervisorRole, isReportRole, isServiceProviderRole, isStaffQueueRole]);

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(Number(activeTab) + 1, tabItems.length - 1)
        : Math.max(Number(activeTab) - 1, 0);
    setActiveTab(String(newIndex));

    if (tabsListRef.current) {
      tabsListRef.current.scrollBy({
        left: direction === "next" ? 50 : -50,
        behavior: "smooth",
      });
    }
  };

  // Map tab content based on role
  const tabContentMap = useMemo(
    () => ({
      supervisor: {
        0: <SupervisorDashboard roleOverride={effectiveRole} />,
        1: <GenerateReport roleOverride={effectiveRole} />,
      },
      report: {
        0: <GenerateReport roleOverride={effectiveRole} />,
      },
      staff: {
        0: <CaretakerQueue roleOverride={effectiveRole} />,
      },
      sp: {
        0: <RedirectedComplaints />,
        1: <GenerateReport roleOverride={effectiveRole} />,
      },
      complaint_admin: {
        0: <AdminDashboard />,
        1: <GenerateReport roleOverride={effectiveRole} />,
      },
      default: {
        0: <FormPage roleOverride={effectiveRole} />,
        1: <ComplaintHistory roleOverride={effectiveRole} />,
        2: <Feedback />,
      },
    }),
    [effectiveRole],
  );

  const getTabContent = () => {
    let content;
    if (isRoleLoading) return <Loader />;

    if (isComplaintAdminRole) content = tabContentMap.complaint_admin[activeTab];
    else if (isSupervisorRole) content = tabContentMap.supervisor[activeTab];
    else if (isReportRole) content = tabContentMap.report[activeTab];
    else if (isServiceProviderRole) content = tabContentMap.sp[activeTab];
    else if (isStaffQueueRole) content = tabContentMap.staff[activeTab];
    else content = tabContentMap.default[activeTab];

    return content || <Loader />;
  };

  return (
    <div style={{ fontFamily: "Manrope" }}>
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <Flex justify="flex-start" align="center" gap="1rem" mt="1.5rem">
          <NavigationButton
            direction="prev"
            onClick={() => handleTabChange("prev")}
          />

          <div className={classes.fusionTabsContainer} ref={tabsListRef}>
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
                {tabItems.map((item, index) => (
                  <Tabs.Tab
                    value={String(index)}
                    key={item.title}
                    className={
                      activeTab === String(index)
                        ? classes.fusionActiveRecentTab
                        : ""
                    }
                  >
                    <Text>{item.title}</Text>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </div>

          <NavigationButton
            direction="next"
            onClick={() => handleTabChange("next")}
          />
        </Flex>
      </Flex>

      <Flex direction="row" justify="start" align="start">
        <Suspense fallback={<Loader />}>{getTabContent()}</Suspense>
      </Flex>
    </div>
  );
}

export default ComplaintModuleLayout;
