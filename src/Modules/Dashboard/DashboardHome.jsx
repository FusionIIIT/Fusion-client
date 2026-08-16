import { useMemo } from "react";
import { Card, Stack, Text } from "@mantine/core";
import { useSelector } from "react-redux";

import { ModulePage } from "../../ui/components/ModulePage";
import { buildNavGroups } from "../../ui/nav/navigation";
import { flattenNavLinks } from "../../ui/nav/match";
import PendingWork from "./PendingWork";
import StudentCreditSummary from "./StudentCreditSummary";

export default function DashboardHome() {
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.username);
  const programmeType = useSelector((state) => state.user.programmeType);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );

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
      </Stack>
    </ModulePage>
  );
}
