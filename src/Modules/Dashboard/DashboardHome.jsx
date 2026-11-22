import { useMemo } from "react";
import { Card, Stack, Text } from "@mantine/core";
import { useSelector } from "react-redux";

import { ModulePage } from "../../ui/components/ModulePage";
import { buildNavGroups } from "../../ui/nav/navigation";
import { flattenNavLinks } from "../../ui/nav/match";
import PendingWork from "./PendingWork";
import StudentCreditSummary from "./StudentCreditSummary";
import AlumniHome from "../Academic/AlumniHome";
import { isLockedStatus } from "../../ui/nav/roles";

export default function DashboardHome() {
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.username);
  const programmeType = useSelector((state) => state.user.programmeType);
  const studentStatus = useSelector((state) => state.user.studentStatus);
  const accessibleModules = useSelector(
    (state) => state.user.currentAccessibleModules,
  );

  const reachablePaths = useMemo(
    () =>
      flattenNavLinks(
        buildNavGroups({
          role,
          accessibleModules,
          programmeType,
          studentStatus,
        }),
      ).map((link) => link.to),
    [role, accessibleModules, programmeType, studentStatus],
  );

  if (role === "student") {
    // An alumnus (or other stopped student) lands on their Alumni page first.
    const locked = isLockedStatus(studentStatus);
    return (
      <ModulePage
        title="Dashboard"
        subtitle="Your credit standing towards the degree"
      >
        <Stack gap="lg">
          {locked && <AlumniHome />}
          <StudentCreditSummary />
        </Stack>
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
