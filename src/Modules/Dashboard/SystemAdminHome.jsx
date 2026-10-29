import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Timeline,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import {
  Clock,
  ClockCounterClockwise,
  MagnifyingGlass,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";

import { ModulePage } from "../../ui/components/ModulePage";
import {
  systemAdminActivityRoute,
  systemAdminRoleAssignmentsRoute,
} from "../../routes/dashboardRoutes";
import classes from "./SystemAdminHome.module.css";

const dateTime = (value) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function SummaryCard({ label, value, icon: Icon, detail }) {
  return (
    <Card className={classes.summaryCard} padding="lg" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text className={classes.summaryLabel}>{label}</Text>
          <Text className={classes.summaryValue}>{value}</Text>
          <Text size="xs" c="dimmed">
            {detail}
          </Text>
        </Stack>
        <ThemeIcon className={classes.summaryIcon} size={42} radius="md">
          <Icon size={21} weight="duotone" />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
  detail: PropTypes.string.isRequired,
};

export default function SystemAdminHome() {
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activityEvents, setActivityEvents] = useState([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem("authToken");
    axios
      .get(systemAdminRoleAssignmentsRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => {
        if (active) setAssignments(data.assignments ?? []);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.status === 403
            ? "Your account does not have System Admin access."
            : "Could not load role assignments. Check that the backend is running, then retry.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const roleOptions = useMemo(
    () => [...new Set(assignments.map((assignment) => assignment.role))].sort(),
    [assignments],
  );
  const visibleAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesRole =
        roleFilter === "all" || assignment.role === roleFilter;
      const matchesSearch =
        !query ||
        [
          assignment.name,
          assignment.username,
          assignment.role,
          assignment.role_name,
          assignment.department,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      return matchesRole && matchesSearch;
    });
  }, [assignments, roleFilter, search]);

  const peopleCount = useMemo(
    () => new Set(assignments.map((assignment) => assignment.username)).size,
    [assignments],
  );
  const activeCount = assignments.filter(
    (item) => item.status === "Active",
  ).length;

  const openActivity = async (assignment) => {
    setSelectedAssignment(assignment);
    setActivityEvents([]);
    setActivityTotal(0);
    setActivityError("");
    setActivityLoading(true);
    const token = sessionStorage.getItem("authToken");
    const params = new URLSearchParams({
      username: assignment.username,
      role: assignment.role,
    });
    try {
      const { data } = await axios.get(
        `${systemAdminActivityRoute}?${params.toString()}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      setActivityEvents(data.events ?? []);
      setActivityTotal(data.total ?? 0);
    } catch (requestError) {
      setActivityError(
        requestError.response?.status === 403
          ? "Your account does not have System Admin access."
          : "Could not load this activity timeline.",
      );
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <ModulePage
      title="System Admin"
      subtitle="Read-only overview of Fusion role assignments and their effective periods."
    >
      <Stack gap="lg">
        <div className={classes.notice}>
          <ThemeIcon className={classes.noticeIcon} size={38} radius="md">
            <ShieldCheck size={21} weight="duotone" />
          </ThemeIcon>
          <div>
            <Text fw={700}>Read-only access</Text>
            <Text size="sm" c="dimmed">
              Review the roles held across Fusion. Role records cannot be
              changed from this page.
            </Text>
          </div>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
          <SummaryCard
            label="Role assignments"
            value={assignments.length}
            icon={ShieldCheck}
            detail="Current records in Fusion"
          />
          <SummaryCard
            label="People"
            value={peopleCount}
            icon={UsersThree}
            detail="Unique role holders"
          />
          <SummaryCard
            label="Roles"
            value={roleOptions.length}
            icon={ShieldCheck}
            detail="Distinct designations"
          />
          <SummaryCard
            label="Active now"
            value={activeCount}
            icon={Clock}
            detail="Within the stored time range"
          />
        </SimpleGrid>

        <Card className={classes.directoryCard} padding="lg" radius="md">
          <Group justify="space-between" align="flex-end" mb="md">
            <div>
              <Text className={classes.sectionTitle}>Role directory</Text>
              <Text size="sm" c="dimmed">
                Search people and review their role start and end times.
              </Text>
            </div>
            <Badge className={classes.readOnlyBadge} variant="light">
              VIEW ONLY
            </Badge>
          </Group>

          <div className={classes.filters}>
            <TextInput
              aria-label="Search role assignments"
              placeholder="Search name, username, role, or department"
              leftSection={<MagnifyingGlass size={17} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <Select
              aria-label="Filter by role"
              data={[
                { value: "all", label: "All roles" },
                ...roleOptions.map((role) => ({ value: role, label: role })),
              ]}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value || "all")}
            />
          </div>

          {error && (
            <Alert color="red" title="Unable to show role directory" mt="md">
              {error}
            </Alert>
          )}
          {loading ? (
            <div className={classes.loading}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading role assignments…
              </Text>
            </div>
          ) : !error ? (
            <div className={classes.tableWrap}>
              <Table
                horizontalSpacing="md"
                verticalSpacing="sm"
                highlightOnHover
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Person</Table.Th>
                    <Table.Th>Role</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Start time</Table.Th>
                    <Table.Th>End time</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Activity</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {visibleAssignments.map((assignment) => (
                    <Table.Tr key={assignment.id}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {assignment.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {assignment.username}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {assignment.role}
                        </Text>
                        {assignment.role_name !== assignment.role && (
                          <Text size="xs" c="dimmed">
                            {assignment.role_name}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>{assignment.department || "—"}</Table.Td>
                      <Table.Td>{dateTime(assignment.start_time)}</Table.Td>
                      <Table.Td>{dateTime(assignment.end_time)}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            assignment.status === "Active"
                              ? "teal"
                              : assignment.status === "Scheduled"
                                ? "blue"
                                : "gray"
                          }
                          variant="light"
                        >
                          {assignment.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<ClockCounterClockwise size={15} />}
                          onClick={() => openActivity(assignment)}
                        >
                          Timeline
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {!visibleAssignments.length && (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text ta="center" c="dimmed" py="xl">
                          {assignments.length
                            ? "No roles match those filters."
                            : "No role assignments are recorded yet."}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </div>
          ) : null}
        </Card>
      </Stack>
      <Modal
        opened={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title={
          selectedAssignment
            ? `${selectedAssignment.name} · ${selectedAssignment.role}`
            : "Role activity"
        }
        centered
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Successful actions and downloads by {selectedAssignment?.username}{" "}
            in this role.
          </Text>
          {activityError && (
            <Alert color="red" title="Unable to load timeline">
              {activityError}
            </Alert>
          )}
          {activityLoading ? (
            <div className={classes.loading}>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading activity…
              </Text>
            </div>
          ) : !activityError && activityEvents.length ? (
            <>
              <Text size="xs" c="dimmed">
                Showing the latest {activityEvents.length} of {activityTotal}{" "}
                recorded actions.
              </Text>
              <Timeline
                active={activityEvents.length}
                bulletSize={22}
                lineWidth={2}
              >
                {activityEvents.map((event) => (
                  <Timeline.Item key={event.id} title={event.action}>
                    <Text size="xs" c="dimmed">
                      {dateTime(event.timestamp)}
                      {event.resource ? ` · ${event.resource}` : ""}
                      {event.method ? ` · ${event.method}` : ""}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </>
          ) : !activityError ? (
            <Text size="sm" c="dimmed" py="md">
              No actions have been recorded for this user in this role yet.
            </Text>
          ) : null}
        </Stack>
      </Modal>
    </ModulePage>
  );
}
