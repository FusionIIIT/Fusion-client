import { Card, Flex, Loader } from "@mantine/core";
import {
  BellSimple,
  CalendarCheck,
  ChatCircleText,
  ForkKnife,
  IdentificationCard,
  ListChecks,
  Wallet,
  Money,
  SignOut,
  SquaresFour,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import UpdatePayments from "./UpdatePayments.jsx";
import Registration from "./Registration.jsx";
import Deregistration from "./Deregistration.jsx";
import ViewMenu from "./ViewMenu.jsx";
import MessFeedback from "./StudentFeedback.jsx";
import Applications from "./Applications.jsx";
import ViewBillandPayments from "./ViewBillAndPayments.jsx";
import { getMessStatusRoute } from "../routes";
import MessDashboardShell from "./MessDashboardShell.jsx";
import MenuPollVoting from "./MenuPollVoting.jsx";
import PortalAnnouncements from "./PortalAnnouncements.jsx";
// import { StudentVacationSurvey } from "./VacationSurvey.jsx";

function Student() {
  const studentId = useSelector((state) => state.user.roll_no) || "Unavailable";
  const user_name = useSelector((state) => state.user.name) || "Student";
  const [activeTab, setActiveTab] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState("Loading...");
  const tabItems = [
    {
      key: "announcements",
      title: "Announcements",
      description: "Read the latest mess-wide notices and operational updates.",
      icon: <BellSimple size={18} />,
      component: <PortalAnnouncements />,
    },
    {
      key: "viewMenu",
      title: "Monthly Menu",
      description:
        "Check the current weekly menu for both central mess options.",
      icon: <ForkKnife size={18} />,
      component: <ViewMenu />,
    },
    {
      key: "viewBillPayments",
      title: "Billing & Finances",
      description: "Track your active bill and review past mess payments.",
      icon: <Wallet size={18} />,
      component: <ViewBillandPayments />,
    },
    {
      key: "menuPolls",
      title: "Menu Polls",
      description: "Vote on upcoming dishes planned for your registered mess.",
      icon: <ListChecks size={18} />,
      component: <MenuPollVoting />,
    },
    // {
    //   key: "vacationSurvey",
    //   title: "Vacation Survey",
    //   description: "Respond to vacation food preference surveys.",
    //   icon: <CalendarCheck size={18} />,
    //   component: <StudentVacationSurvey />,
    // },
    {
      key: "registration",
      title: "Enroll in Mess",
      description: "Submit payment details and register for the current cycle.",
      icon: <CalendarCheck size={18} />,
      component: <Registration />,
    },
    {
      key: "updatePayment",
      title: "Update Payments",
      description: "Raise a correction request if your payment needs review.",
      icon: <Money size={18} />,
      component: <UpdatePayments />,
    },
    {
      key: "feedback",
      title: "Give Feedback",
      description: "Send quick feedback on food, hygiene, or maintenance.",
      icon: <ChatCircleText size={18} />,
      component: <MessFeedback />,
    },
    {
      key: "applications",
      title: "Leave / Applications",
      description: "Manage rebate and special-food requests from one place.",
      icon: <CalendarCheck size={18} />,
      component: <Applications />,
    },
    {
      key: "deregistration",
      title: "Opt Out (Deregister)",
      description: "Request mess deregistration for your selected end date.",
      icon: <SignOut size={18} />,
      component: <Deregistration />,
    },
  ];

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(getMessStatusRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const status =
          response.data.payload?.current_mess_status || "Not Found";
        setRegistrationStatus(status);
      } catch (error) {
        console.error("Error fetching registration status:", error);
        setRegistrationStatus("Unregistered"); // Default to unregistered on API failure
      }
    };

    if (studentId) fetchRegistrationStatus();
  }, [studentId]);

  const filteredTabItems = tabItems.filter((item) => {
    if (registrationStatus === "Registered" && item.key === "registration")
      return false;
    if (
      registrationStatus !== "Registered" &&
      [
        "deregistration",
        "updatePayment",
        "feedback",
        "applications",
        "menuPolls",
      ].includes(item.key)
    )
      return false;
    return true;
  });

  useEffect(() => {
    if (!filteredTabItems.length) {
      setActiveTab(null);
      return;
    }

    if (!filteredTabItems.some((item) => item.key === activeTab)) {
      setActiveTab(filteredTabItems[0].key);
    }
  }, [activeTab, filteredTabItems]);

  const activeTabItem = filteredTabItems.find((item) => item.key === activeTab);
  const isRegistered = registrationStatus === "Registered";
  const summaryCards = [
    {
      label: "Current status",
      value: registrationStatus,
      description: isRegistered
        ? "Student actions and service requests are available."
        : "Register in mess to unlock applications and payment updates.",
      icon: <ForkKnife size={18} weight="fill" />,
    },
    {
      label: "Available sections",
      value: filteredTabItems.length,
      description:
        "Options automatically adapt to your mess registration state.",
      icon: <SquaresFour size={18} weight="fill" />,
    },
    {
      label: "Roll number",
      value: studentId,
      description: "Signed-in student account for this mess workspace.",
      icon: <IdentificationCard size={18} weight="fill" />,
    },
  ];
  const badges = [
    { label: "Student workspace", color: "blue" },
    {
      label: `Status: ${registrationStatus}`,
      color:
        registrationStatus === "Loading..."
          ? "gray"
          : isRegistered
            ? "teal"
            : "orange",
    },
  ];

  return (
    <MessDashboardShell
      eyebrow={`Hello, ${user_name}`}
      title="Mess Management"
      description="Manage registration, billing, menu access, and day-to-day requests in the same Fusion flow used across other modules."
      badges={badges}
      summaryCards={summaryCards}
      tabs={filteredTabItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTabItem ? (
        activeTabItem.component
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

export default Student;
