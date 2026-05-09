import { Card, Flex, Loader } from "@mantine/core";
import {
  ChatCircleText,
  ForkKnife,
  Gauge,
  ListChecks,
  UserList,
} from "@phosphor-icons/react";
import { useState } from "react";
import ViewMenu from "./ViewMenu.jsx";
import ViewFeedback from "./ViewFeedback.jsx";
import MessAnnouncements from "./MessAnnouncements.jsx";
import ViewRegistrations from "./ViewRegistration.jsx";
import MessDashboardShell from "./MessDashboardShell.jsx";
import ManageMenuPolls from "./ManageMenuPolls.jsx";
import WardenDecisionDesk from "./WardenDecisionDesk.jsx";
import PortalAnnouncements from "./PortalAnnouncements.jsx";
// import { CaretakerVacationSurvey } from "./VacationSurvey.jsx";

const tabItems = [
  {
    key: "board",
    title: "Operations Board",
    description:
      "A quick overview of live queues and operational pressure points.",
    icon: <Gauge size={18} />,
    component: <MessAnnouncements />,
  },
  {
    key: "decisions",
    title: "Escalated Requests",
    description:
      "Review caretaker escalations, add final remarks, and close them cleanly.",
    icon: <ListChecks size={18} />,
    component: <WardenDecisionDesk />,
  },
  {
    key: "announcements",
    title: "Announcements",
    description:
      "Publish portal notices and keep the mess communication board current.",
    icon: <ChatCircleText size={18} />,
    component: <PortalAnnouncements canManage />,
  },
  {
    key: "feedback",
    title: "Feedback Review",
    description: "Read student feedback and clear pending issues by category.",
    icon: <ChatCircleText size={18} />,
    component: <ViewFeedback />,
  },
  {
    key: "menu",
    title: "Current Menu",
    description: "Review the published weekly menu for both central messes.",
    icon: <ForkKnife size={18} />,
    component: <ViewMenu />,
  },
  {
    key: "polls",
    title: "Menu Polls",
    description:
      "Create menu polls for students and review the vote split live.",
    icon: <ListChecks size={18} />,
    component: <ManageMenuPolls />,
  },
  // {
  //   key: "vacationSurvey",
  //   title: "Vacation Survey",
  //   description: "Review vacation food preference surveys.",
  //   icon: <CalendarCheck size={18} />,
  //   component: <CaretakerVacationSurvey />,
  // },
  {
    key: "registrations",
    title: "Student Registrations",
    description:
      "Browse current mess registrations with simple search and filters.",
    icon: <UserList size={18} />,
    component: <ViewRegistrations />,
  },
];

function Warden() {
  const [activeTab, setActiveTab] = useState("board");
  const activeItem = tabItems.find((item) => item.key === activeTab);
  const summaryCards = [
    {
      label: "Review areas",
      value: tabItems.length,
      description: "Operations, feedback, menu visibility, and registrations.",
      icon: <Gauge size={18} weight="fill" />,
    },
    {
      label: "Primary focus",
      value: "Oversight",
      description: "Monitor service quality and catch pending issues early.",
      icon: <ChatCircleText size={18} weight="fill" />,
    },
    {
      label: "Student lens",
      value: "Menu + records",
      description:
        "Keep the experience clear for students and reviewers alike.",
      icon: <UserList size={18} weight="fill" />,
    },
  ];

  return (
    <MessDashboardShell
      eyebrow="Warden workspace"
      title="Mess Warden Dashboard"
      description="Keep mess operations easy to supervise with the same simple Fusion layout used across other modules."
      badges={[
        { label: "Supervision", color: "indigo" },
        { label: "Readiness review", color: "blue" },
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

export default Warden;
