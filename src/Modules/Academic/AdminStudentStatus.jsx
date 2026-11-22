import { useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  readmitStudentRoute,
  studentStatusRoute,
  withdrawStudentRoute,
} from "../../routes/academicRoutes";
import { statusLabel } from "../../ui/nav/roles";

const authHeaders = () => ({
  headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
});

const STATUS_COLORS = { PRESENT: "green", WITHDRAWN: "orange" };

const ACTIONS = {
  withdraw: {
    button: "Withdraw",
    confirm: "Withdraw student",
    route: withdrawStudentRoute,
    text: "They keep their login but can only view their courses and results. Their records stay as they are, and nothing about them can be changed until they are re-admitted.",
  },
  readmit: {
    button: "Re-admit",
    confirm: "Re-admit student",
    route: readmitStudentRoute,
    text: "They become a present student again and can register as before.",
  },
};

const ACTION_LABELS = { withdraw: "Withdrawn", readmit: "Re-admitted" };

// What the office has to clear before a withdrawal, one line each.
function blockerLines(blockers) {
  if (!blockers) return [];
  const sems = (list) => list.map((n) => `semester ${n}`).join(", ");
  return [
    blockers.ungraded?.length &&
      `Courses without a grade: ${blockers.ungraded.join(", ")}`,
    blockers.unverified?.length &&
      `Grades not yet verified: ${blockers.unverified.join(", ")}`,
    blockers.pre_registration?.length &&
      `Pre-registration choices: ${sems(blockers.pre_registration)}`,
    blockers.final_registration?.length &&
      `Final registration not verified: ${sems(blockers.final_registration)}`,
  ].filter(Boolean);
}

// Withdraw a student (read-only from then on, records kept) or re-admit one
// withdrawn by mistake. Every change is kept with who did it and why.
export default function AdminStudentStatus() {
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");

  const lookUp = async () => {
    setLoading(true);
    setError(null);
    setStudent(null);
    try {
      const { data } = await axios.get(studentStatusRoute, {
        params: { roll_no: rollNo.trim().toUpperCase() },
        ...authHeaders(),
      });
      setStudent(data);
    } catch (e) {
      setError({
        detail:
          e.response?.data?.detail ||
          e.response?.data?.error ||
          "Could not find that student.",
      });
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    const action = ACTIONS[pending];
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        action.route,
        { roll_no: student.roll_no, reason: reason.trim() },
        authHeaders(),
      );
      setStudent(data);
      setPending(null);
      setReason("");
    } catch (e) {
      setPending(null);
      setError({
        detail:
          e.response?.data?.detail ||
          e.response?.data?.error ||
          "The change could not be made.",
        blockers: e.response?.data?.blockers,
      });
    } finally {
      setLoading(false);
    }
  };

  const status = student?.status;
  const available =
    status === "PRESENT"
      ? "withdraw"
      : status === "WITHDRAWN"
        ? "readmit"
        : null;
  // A present student with an open semester cannot be withdrawn yet.
  const openWork = status === "PRESENT" ? blockerLines(student?.blockers) : [];

  return (
    <Stack gap="md" maw={900}>
      <Group align="flex-end">
        <TextInput
          label="Roll number"
          placeholder="23BEC020"
          value={rollNo}
          onChange={(e) => setRollNo(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && rollNo.trim() && lookUp()}
        />
        <Button onClick={lookUp} loading={loading} disabled={!rollNo.trim()}>
          Look up
        </Button>
      </Group>

      {error && (
        <Alert color={error.blockers ? "yellow" : "red"}>
          <Text size="sm">{error.detail}</Text>
          {blockerLines(error.blockers).map((line) => (
            <Text size="sm" key={line}>
              {line}
            </Text>
          ))}
        </Alert>
      )}

      {!error && openWork.length > 0 && (
        <Alert color="yellow">
          <Text size="sm">
            Before withdrawing, clear these with the usual tools:
          </Text>
          {openWork.map((line) => (
            <Text size="sm" key={line}>
              {line}
            </Text>
          ))}
        </Alert>
      )}

      {student && (
        <Card withBorder radius="md" p="lg">
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="sm">
                <Title order={3}>{student.name}</Title>
                <Badge color={STATUS_COLORS[status] ?? "gray"} variant="light">
                  {statusLabel(status)}
                </Badge>
              </Group>
              {available && (
                <Button
                  color={available === "withdraw" ? "orange" : "blue"}
                  variant="light"
                  onClick={() => setPending(available)}
                  disabled={openWork.length > 0}
                >
                  {ACTIONS[available].button}
                </Button>
              )}
            </Group>
            <Text c="dimmed">{student.roll_no}</Text>
            <Text c="dimmed">
              {`${student.discipline} · batch ${student.batch} · semester ${student.semester}`}
            </Text>

            <Title order={5} mt="md">
              History
            </Title>
            {student.history.length === 0 ? (
              <Text size="sm" c="dimmed">
                No changes recorded yet.
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>When</Table.Th>
                    <Table.Th>Change</Table.Th>
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Reason</Table.Th>
                    <Table.Th>By</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {student.history.map((h) => (
                    <Table.Tr key={`${h.created_at}-${h.action}`}>
                      <Table.Td>
                        {new Date(h.created_at).toLocaleString("en-IN")}
                      </Table.Td>
                      <Table.Td>{ACTION_LABELS[h.action] ?? h.action}</Table.Td>
                      <Table.Td>{h.semester_no ?? "-"}</Table.Td>
                      <Table.Td>{h.reason}</Table.Td>
                      <Table.Td>{h.performed_by ?? "-"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Card>
      )}

      <Modal
        opened={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending ? `${ACTIONS[pending].button} ${student?.roll_no}` : ""}
        centered
      >
        {pending && (
          <Stack>
            <Text size="sm">{ACTIONS[pending].text}</Text>
            <Textarea
              label="Reason"
              required
              autosize
              minRows={2}
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button
                color={pending === "withdraw" ? "orange" : "blue"}
                onClick={submit}
                loading={loading}
                disabled={!reason.trim()}
              >
                {ACTIONS[pending].confirm}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
