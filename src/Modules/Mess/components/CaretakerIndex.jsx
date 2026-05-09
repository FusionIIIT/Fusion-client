import { Card, Flex, Loader } from "@mantine/core";
import {
  CalendarCheck,
  ChatCircleText,
  ClipboardText,
  ForkKnife,
  Gauge,
  Hamburger,
  ListChecks,
  UserList,
} from "@phosphor-icons/react";
import { useState } from "react";
import UpdateSemDates from "./UpdateSemDates.jsx";
import ViewFeedback from "./ViewFeedback.jsx";
import RespondToRebateRequest from "./RespondRebate.jsx";
import ViewSpecialFoodRequest from "./ViewSpecialFoodRequest.jsx";
import RegDeregUpdatePayment from "./RegisterDeregisterUpdateRequest.jsx";
import UpdateMenu from "./UpdateMenu.jsx";
import ViewRegistrations from "./ViewRegistration.jsx";
import MessAnnouncements from "./MessAnnouncements.jsx";
import MessDashboardShell from "./MessDashboardShell.jsx";
import ManageMenuPolls from "./ManageMenuPolls.jsx";
import PortalAnnouncements from "./PortalAnnouncements.jsx";
// import { CaretakerVacationSurvey } from "./VacationSurvey.jsx";

const tabItems = [
  {
    key: "operations",
    title: "Operations Board",
    description: "See the live counts that need caretaker action right now.",
    icon: <Gauge size={18} />,
    component: <MessAnnouncements />,
  },
  {
    key: "announcements",
    title: "Announcements",
    description:
      "Publish and archive portal announcements for the mess module.",
    icon: <ChatCircleText size={18} />,
    component: <PortalAnnouncements canManage />,
  },
  {
    key: "feedback",
    title: "Feedback Inbox",
    description: "Review unread student feedback and mark handled items.",
    icon: <ChatCircleText size={18} />,
    component: <ViewFeedback />,
  },
  {
    key: "rebate",
    title: "Rebate Review",
    description: "Approve, decline, and remark on student rebate requests.",
    icon: <ClipboardText size={18} />,
    component: <RespondToRebateRequest />,
  },
  {
    key: "requests",
    title: "Request Desk",
    description:
      "Handle registration, deregistration, and payment update queues.",
    icon: <CalendarCheck size={18} />,
    component: <RegDeregUpdatePayment />,
  },
  {
    key: "special",
    title: "Special Food",
    description: "Process pending special-food requests from students.",
    icon: <Hamburger size={18} />,
    component: <ViewSpecialFoodRequest />,
  },
  {
    key: "registrations",
    title: "Registrations",
    description: "Search and filter the currently registered student list.",
    icon: <UserList size={18} />,
    component: <ViewRegistrations />,
  },
  {
    key: "menu",
    title: "Menu Editor",
    description: "Update the published weekly menu for both mess options.",
    icon: <ForkKnife size={18} />,
    component: <UpdateMenu />,
  },
  {
    key: "polls",
    title: "Menu Polls",
    description:
      "Create polls for upcoming dishes and track how students vote.",
    icon: <ListChecks size={18} />,
    component: <ManageMenuPolls />,
  },
  // {
  //   key: "vacationSurvey",
  //   title: "Vacation Survey",
  //   description: "Create and review vacation food preference surveys.",
  //   icon: <CalendarCheck size={18} />,
  //   // component: <CaretakerVacationSurvey />,
  // },
  {
    key: "window",
    title: "Registration Window",
    description: "Set the date window during which students can register.",
    icon: <CalendarCheck size={18} />,
    component: <UpdateSemDates />,
  },
];

function Caretaker() {
  const [activeTab, setActiveTab] = useState("operations");
  const activeItem = tabItems.find((item) => item.key === activeTab);
  const summaryCards = [
    {
      label: "Live workflows",
      value: tabItems.length,
      description: "Everything from feedback and approvals to menu publishing.",
      icon: <Gauge size={18} weight="fill" />,
    },
    {
      label: "Menu control",
      value: "2 messes",
      description:
        "Central Mess 1 and Central Mess 2 stay editable from one place.",
      icon: <ForkKnife size={18} weight="fill" />,
    },
    {
      label: "Primary focus",
      value: "Approvals",
      description:
        "Move pending requests forward without hunting through the UI.",
      icon: <ClipboardText size={18} weight="fill" />,
    },
  ];

  return (
    <MessDashboardShell
      eyebrow="Caretaker workspace"
      title="Mess Caretaker Console"
      description="Review student requests, publish menus, and keep daily mess operations moving in a cleaner Fusion-style layout."
      badges={[
        { label: "Operations", color: "cyan" },
        { label: "Approval queues", color: "blue" },
      ]}
      summaryCards={summaryCards}
      tabs={tabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeItem ? (
        activeItem.component
      ) : (
        <Card radius="xl" p="xl" shadow="xs" withBorder>
          <Flex justify="center" align="center" py="xl">
            <Loader />
          </Flex>
        </Card>
      )}
    </MessDashboardShell>
  );
}

export default Caretaker;
