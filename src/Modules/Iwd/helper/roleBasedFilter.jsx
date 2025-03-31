import CreateRequest from "../components/CreateRequestForm";
// import IssueWorkOrder from "../components/IssueWorkOrder";
// import RejectedRequests from "../components/RejectedRequest";
// import RequestsInProgress from "../components/RequestsInProgress";
import FinalBillRequest from "../components/FinalBillRequest";
import ManageBudget from "../components/ManageBudget";
// import CreatedRequests from "../components/CreatedRequests";
import ViewBudget from "../components/ViewBudget";
// import ProcessBills from "../components/ProcessBills";
import RequestsStatus from "../components/RequestsStatus";
// import ApproveRejectRequest from "../components/ApproveRejectRequest";
// import AuditDocument from "../components/AuditDocument";

const RoleBasedFilter = ({ setActiveTab }) => {
  const tabItems = [
    {
      title: "Create Request",
      component: <CreateRequest setActiveTab={setActiveTab} />,
    },
    // { title: "Requests in Progress", component: <RequestsInProgress /> },
    // {
    //   title: "Issue Work Order",
    //   component: <IssueWorkOrder />,
    // },
    { title: "Generate Final Bill", component: <FinalBillRequest /> },
    // {
    //   title: "Rejected Requests",
    //   component: <RejectedRequests />,
    // },
    { title: "Manage Budget", component: <ManageBudget /> },
    // {
    //   title: "Created Requests",
    //   component: <CreatedRequests />,
    // },
    { title: "View Budget", component: <ViewBudget /> },
    // { title: "Process Bills", component: <ProcessBills /> },
    // {
    //   title: "Approve/Reject Requests",
    //   component: <ApproveRejectRequest />,
    // },
    // { title: "Audit Document", component: <AuditDocument /> },
    { title: "Requests Status", component: <RequestsStatus /> },
  ];
  const roleBasedTabs = {
    Director: tabItems.filter((tab) =>
      ["Create Request", "View Budget", "Requests Status"].includes(tab.title),
    ),
    "Dean (P&D)": tabItems.filter((tab) =>
      ["Create Request", "Requests Status"].includes(tab.title),
    ),
    Auditor: tabItems.filter((tab) =>
      ["View Budget", "Requests Status"].includes(tab.title),
    ),
    SectionHead_IWD: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    Professor: tabItems.filter((tab) =>
      ["Create Request", "Requests Status"].includes(tab.title),
    ),
    EE: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    "Executive Engineer (Civil)": tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    Civil_AE: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    Civil_JE: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    Electrical_JE: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    Electrical_AE: tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    "Junior Engineer": tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
    "Admin IWD": tabItems.filter((tab) =>
      ["Create Request", "Manage Budget", "Requests Status"].includes(
        tab.title,
      ),
    ),
    "Accounts Admin": tabItems.filter((tab) =>
      [
        "Create Request",
        "Manage Budget",
        "View Budget",
        "Requests Status",
      ].includes(tab.title),
    ),
  };
  return { roleBasedTabs, tabItems };
};

export default RoleBasedFilter;
