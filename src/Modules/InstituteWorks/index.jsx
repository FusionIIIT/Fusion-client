import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab_ } from "../../redux/moduleslice";
import InstituteWorksShell from "./components/common/InstituteWorksShell";
import CreateRequestView from "./pages/CreateRequestView";
import CreatedRequestsView from "./pages/CreatedRequestsView";

import RequestsStatusView from "./pages/RequestsStatusView";
import DirectorApprovedView from "./pages/DirectorApprovedView";
import WorkProgressView from "./pages/WorkProgressView";
import BudgetManagementView from "./pages/BudgetManagementView";
import DeanDirectorQueueView from "./pages/DeanDirectorQueueView";
import BillAuditView from "./pages/BillAuditView";
import BillSettlementView from "./pages/BillSettlementView";
import AdminApprovalQueueView from "./pages/AdminApprovalQueueView";
import ProposalBuilderView from "./pages/ProposalBuilderView";
import BillGenerationView from "./pages/BillGenerationView";
import BillProcessingView from "./pages/BillProcessingView";
import DeanProcessingQueueView from "./pages/DeanProcessingQueueView";
import RejectedRequestsView from "./pages/RejectedRequestsView";
import VendorManagementView from "./pages/VendorManagementView";
import RequestsInProgressView from "./pages/RequestsInProgressView";
// NEW SLA & INVENTORY VIEWS
import SLADashboardView from "./pages/SLADashboardView";
import InventoryManagementView from "./pages/InventoryManagementView";
import FeedbackView from "./pages/FeedbackView";

const ENGINEER_ROLES = [
  "junior engineer",
  "executive engineer (civil)",
  "electrical_ae",
  "electrical_je",
  "ee",
  "civil_ae",
  "civil_je",
];

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function isEngineerRole(normalizedRole) {
  return ENGINEER_ROLES.some((role) => normalizedRole.includes(role));
}

function isDeanProcessingRole(normalizedRole) {
  return (
    normalizedRole.includes("dean (p&d)") || normalizedRole.startsWith("hod")
  );
}

function InstituteWorks() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.user.role);
  const [activeTab, setActiveTab] = useState("0");
  const normalizedRole = normalizeRole(role);

  const tabsConfig = useMemo(
    () => [
      {
        title: "Create Request",
        component: CreateRequestView,
        visible: true,
      },
      {
        title: "Created Requests",
        component: CreatedRequestsView,
        visible: true,
      },
      // {
      //   title: "Request Status",
      //   component: RequestsStatusView,
      //   visible: true,
      // },
      {
        title: "Admin Queue",
        component: AdminApprovalQueueView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Proposal Builder",
        component: ProposalBuilderView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Director Approved",
        component: DirectorApprovedView,
        visible: normalizedRole.includes("director"),
      },
      {
        title: "Dean Queue",
        component: DeanDirectorQueueView,
        visible: normalizedRole.includes("director"),
      },
      {
        title: "Dean Processing",
        component: DeanProcessingQueueView,
        visible: isDeanProcessingRole(normalizedRole),
      },
      {
        title: "Rejected Requests",
        component: RejectedRequestsView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Proposal Status",
        component: RequestsInProgressView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Work Progress",
        component: WorkProgressView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Bill Generation",
        component: BillGenerationView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Bill Processing",
        component: BillProcessingView,
        visible: normalizedRole.includes("accounts admin"),
      },
      {
        title: "Vendor Management",
        component: VendorManagementView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Budget Management",
        component: BudgetManagementView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Bill Audit",
        component: BillAuditView,
        visible: normalizedRole.includes("auditor"),
      },
      {
        title: "Bill Settlement",
        component: BillSettlementView,
        visible: normalizedRole.includes("accounts admin"),
      },
      // ===== NEW SLA & INVENTORY TABS (UC-29, UC-30, UC-31) =====
      {
        title: "SLA Dashboard",
        component: SLADashboardView,
        visible:
          normalizedRole.includes("admin iwd") ||
          normalizedRole.includes("director"),
      },
      {
        title: "Inventory Management",
        component: InventoryManagementView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Feedback & Cases",
        component: FeedbackView,
        visible: true,
      },
    ],
    [normalizedRole],
  );

  const visibleTabs = useMemo(
    () => tabsConfig.filter((tab) => tab.visible),
    [tabsConfig],
  );

  const tabItems = visibleTabs.map((tab) => ({ title: tab.title }));

  useEffect(() => {
    const activeIndex = parseInt(activeTab, 10);
    if (!Number.isNaN(activeIndex) && activeIndex < visibleTabs.length) {
      return;
    }
    setActiveTab("0");
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    const activeIndex = parseInt(activeTab, 10);
    const safeIndex = Number.isNaN(activeIndex) ? 0 : activeIndex;
    const activeTitle = visibleTabs[safeIndex]?.title || "Request Status";
    dispatch(setActiveTab_(activeTitle));
  }, [activeTab, dispatch, visibleTabs]);

  const activeIndex = parseInt(activeTab, 10);
  const ActiveComponent =
    visibleTabs[Number.isNaN(activeIndex) ? 0 : activeIndex]?.component ||
    RequestsStatusView;

  return (
    <InstituteWorksShell
      tabs={tabItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <ActiveComponent />
    </InstituteWorksShell>
  );
}

export default InstituteWorks;
