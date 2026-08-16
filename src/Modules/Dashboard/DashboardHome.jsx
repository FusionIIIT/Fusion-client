import { useMemo } from "react";
import { Card, Group, Stack, Text } from "@mantine/core";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell } from "@phosphor-icons/react";

import { ModulePage } from "../../ui/components/ModulePage";
import { buildNavGroups } from "../../ui/nav/navigation";
import { flattenNavLinks } from "../../ui/nav/match";
import PendingWork from "./PendingWork";
import StudentCreditSummary from "./StudentCreditSummary";

export default function DashboardHome() {
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.username);
  const programmeType = useSelector((state) => state.user.programmeType);
  const unreadCount = useSelector((state) => state.notification.unreadCount);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );
  const navigate = useNavigate();

  const reachablePaths = useMemo(
    () =>
      flattenNavLinks(
        buildNavGroups({ role, accessibleModules, programmeType }),
      ).map((link) => link.to),
    [role, accessibleModules, programmeType],
  );

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
        <PendingWork reachablePaths={reachablePaths} />

        {!moduleCount && (
          <Card padding="lg">
            <Text c="dimmed">
              No modules have been granted to your role yet.
            </Text>
          </Card>
        )}

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
