import { Card, Group, Stack, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell } from "@phosphor-icons/react";

import { ModulePage } from "../../ui/components/ModulePage";
import StudentCreditSummary from "./StudentCreditSummary";

export default function DashboardHome() {
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.username);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );
  const navigate = useNavigate();

  if (role === "student") {
    return (
      <ModulePage
        title="Dashboard"
        subtitle="Your credit standing towards the degree"
      >
        <StudentCreditSummary />
      </ModulePage>
    );
  }

  const moduleCount = Object.values(accessibleModules ?? {}).filter(
    Boolean,
  ).length;

  return (
    <ModulePage title={`Welcome, ${username}`}>
      <Stack gap="lg">
        <Card padding="lg">
          <Text c="dimmed">
            {moduleCount
              ? `You have access to ${moduleCount} module${moduleCount === 1 ? "" : "s"}. Pick one from the sidebar.`
              : "No modules have been granted to your role yet."}
          </Text>
        </Card>

        <Card
          padding="lg"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/notifications")}
        >
          <Group gap="sm">
            <Bell size={18} color="var(--mantine-color-blue-6)" />
            <Text fw={600} size="sm">
              {unreadCount
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "Notifications and announcements"}
            </Text>
          </Group>
        </Card>
      </Stack>
    </ModulePage>
  );
}
