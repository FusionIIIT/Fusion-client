import { useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  NativeSelect,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  cancelSemesterDropRoute,
  readmitStudentRoute,
  recordSemesterDropRoute,
  studentStatusRoute,
  withdrawStudentRoute,
} from "../../routes/academicRoutes";
import { statusLabel } from "../../ui/nav/roles";

const authHeaders = () => ({
  headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
});

const STATUS_COLORS = { PRESENT: "green", WITHDRAWN: "orange" };

const when = (iso) => new Date(iso).toLocaleString("en-IN");

// The session a batch spends a semester in: batch 2023, semester 5 -> 2025-26.
function sessionFor(batch, semesterNo) {
  const start = Number(batch) + Math.floor((Number(semesterNo) - 1) / 2);
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

// Courses grouped by the semester and session they were taken in:
// "Grades not yet verified, semester 4 (2024-25): EC2005, EC2006".
function perSemester(label, items = []) {
  const groups = new Map();
  items.forEach(({ code, semester, session }) => {
    const key = `semester ${semester}${session ? ` (${session})` : ""}`;
    groups.set(key, [...(groups.get(key) ?? []), code]);
  });
  return [...groups].map(
    ([key, codes]) => `${label}, ${key}: ${codes.join(", ")}`,
  );
}

// What the office has to clear before a withdrawal, one line each.
function blockerLines(blockers) {
  if (!blockers) return [];
  return [
    ...perSemester("Courses without a grade", blockers.ungraded),
    ...perSemester("Grades not yet verified", blockers.unverified),
  ];
}

// What a withdrawal removes by itself: leftovers of a semester never entered.
function removalLines(removes) {
  if (!removes) return [];
  const sems = (list) => list.map((n) => `semester ${n}`).join(", ");
  return [
    removes.final_registration?.length &&
      `Course allotment never verified: ${sems(removes.final_registration)}`,
    removes.pre_registration?.length &&
      `Pre-registration choices: ${sems(removes.pre_registration)}`,
  ].filter(Boolean);
}

// What the office has to clear before a semester can be dropped.
function dropBlockerLines(blockers) {
  if (!blockers) return [];
  return [
    blockers.registrations?.length &&
      `Course registrations: ${blockers.registrations.join(", ")}`,
    blockers.pre_registration && "Pre-registration choices",
    blockers.final_registration && "Final registration",
  ].filter(Boolean);
}

const ACTIONS = {
  withdraw: {
    title: (s) => `Withdraw ${s.roll_no}`,
    confirm: "Withdraw student",
    color: "orange",
    route: withdrawStudentRoute,
    text: "They keep their login but can only view their courses and results. Their records stay as they are, and nothing about them can be changed until they are re-admitted.",
    lines: blockerLines,
  },
  readmit: {
    title: (s) => `Re-admit ${s.roll_no}`,
    confirm: "Re-admit student",
    color: "blue",
    route: readmitStudentRoute,
    text: "They become a present student again and can register as before.",
    lines: blockerLines,
  },
  drop: {
    title: (s) => `Record a semester drop for ${s.roll_no}`,
    confirm: "Record drop",
    color: "orange",
    route: recordSemesterDropRoute,
    text: "For that semester they take part in nothing: no pre-registration, registration or allocation, and its lists leave them out. They move on with their batch. Its courses are added later with Add course, as Backlog.",
    lines: dropBlockerLines,
  },
  cancelDrop: {
    title: (s, drop) =>
      `Cancel the semester ${drop.semester_no} drop of ${s.roll_no}`,
    confirm: "Cancel the drop",
    dismiss: "Keep it",
    color: "blue",
    route: cancelSemesterDropRoute,
    text: "The semester is open to them again. The drop stays listed as cancelled.",
    lines: dropBlockerLines,
  },
};

const ACTION_LABELS = { withdraw: "Withdrawn", readmit: "Re-admitted" };

// Withdraw a student (read-only from then on, records kept) or re-admit one
// withdrawn by mistake, and record or cancel semester drops. Every change is
// kept with who did it and why.
export default function AdminStudentStatus() {
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // { kind, drop } of the change being confirmed.
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const [semesterNo, setSemesterNo] = useState("");
  const [academicYear, setAcademicYear] = useState("");

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
        lines: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const open = (kind, drop = null) => {
    setReason("");
    setSemesterNo("");
    setAcademicYear("");
    setPending({ kind, drop });
  };

  const chooseSemester = (value) => {
    setSemesterNo(value);
    setAcademicYear(value ? sessionFor(student.batch, value) : "");
  };

  const body = () => {
    const base = { roll_no: student.roll_no };
    if (pending.kind === "drop") {
      return {
        ...base,
        semester_no: Number(semesterNo),
        academic_year: academicYear.trim(),
        reason: reason.trim(),
      };
    }
    if (pending.kind === "cancelDrop") {
      return { ...base, drop_id: pending.drop.id, reason: reason.trim() };
    }
    return { ...base, reason: reason.trim() };
  };

  const submit = async () => {
    const action = ACTIONS[pending.kind];
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(action.route, body(), authHeaders());
      setStudent(data);
      setPending(null);
    } catch (e) {
      setPending(null);
      setError({
        detail:
          e.response?.data?.detail ||
          e.response?.data?.error ||
          "The change could not be made.",
        lines: action.lines(e.response?.data?.blockers),
        blocked: Boolean(e.response?.data?.blockers),
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
  const removals =
    status === "PRESENT" ? removalLines(student?.withdrawal_removes) : [];
  const drops = student?.drops ?? [];
  const liveDropped = new Set(
    drops.filter((d) => !d.cancelled_at).map((d) => d.semester_no),
  );
  const droppable = (student?.semesters ?? []).filter(
    (n) => !liveDropped.has(n),
  );
  const action = pending ? ACTIONS[pending.kind] : null;
  const ready =
    reason.trim() &&
    (pending?.kind !== "drop" || (semesterNo && academicYear.trim()));

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
        <Alert color={error.blocked ? "yellow" : "red"}>
          <Text size="sm">{error.detail}</Text>
          {error.lines.map((line) => (
            <Text size="sm" key={line}>
              {line}
            </Text>
          ))}
        </Alert>
      )}

      {!error && openWork.length > 0 && (
        <Alert color="yellow">
          <Text size="sm">
            Before withdrawing, these grades have to be given and verified in
            Examination:
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
                  color={ACTIONS[available].color}
                  variant="light"
                  onClick={() => open(available)}
                  disabled={openWork.length > 0}
                >
                  {available === "withdraw" ? "Withdraw" : "Re-admit"}
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
                      <Table.Td>{when(h.created_at)}</Table.Td>
                      <Table.Td>{ACTION_LABELS[h.action] ?? h.action}</Table.Td>
                      <Table.Td>{h.semester_no ?? "-"}</Table.Td>
                      <Table.Td style={{ whiteSpace: "pre-line" }}>
                        {h.reason}
                      </Table.Td>
                      <Table.Td>{h.performed_by ?? "-"}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}

            <Group justify="space-between" mt="md">
              <Title order={5}>Semester drops</Title>
              {status === "PRESENT" && (
                <Button
                  size="xs"
                  variant="light"
                  color="orange"
                  onClick={() => open("drop")}
                  disabled={droppable.length === 0}
                >
                  Record semester drop
                </Button>
              )}
            </Group>
            {drops.length === 0 ? (
              <Text size="sm" c="dimmed">
                No semester dropped.
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Academic year</Table.Th>
                    <Table.Th>Reason</Table.Th>
                    <Table.Th>Recorded</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {drops.map((d) => (
                    <Table.Tr key={d.id}>
                      <Table.Td>{d.semester_no}</Table.Td>
                      <Table.Td>{d.academic_year}</Table.Td>
                      <Table.Td>{d.reason}</Table.Td>
                      <Table.Td>
                        {`${d.recorded_by ?? "-"}, ${when(d.recorded_at)}`}
                      </Table.Td>
                      <Table.Td>
                        {d.cancelled_at ? (
                          <Text size="sm" c="dimmed">
                            {`Cancelled by ${d.cancelled_by ?? "-"} on ${when(d.cancelled_at)}: ${d.cancel_reason}`}
                          </Text>
                        ) : (
                          <Group gap="xs">
                            <Badge color="orange" variant="light">
                              Dropped
                            </Badge>
                            {status === "PRESENT" && (
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => open("cancelDrop", d)}
                              >
                                Cancel drop
                              </Button>
                            )}
                          </Group>
                        )}
                      </Table.Td>
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
        title={pending ? action.title(student, pending.drop) : ""}
        centered
      >
        {pending && (
          <Stack>
            <Text size="sm">{action.text}</Text>
            {pending.kind === "withdraw" && removals.length > 0 && (
              <Alert color="gray">
                <Text size="sm">Withdrawing also removes:</Text>
                {removals.map((line) => (
                  <Text size="sm" key={line}>
                    {line}
                  </Text>
                ))}
              </Alert>
            )}
            {pending.kind === "drop" && (
              <>
                <NativeSelect
                  label="Semester"
                  required
                  value={semesterNo}
                  onChange={(e) => chooseSemester(e.currentTarget.value)}
                  data={[
                    { value: "", label: "Choose a semester" },
                    ...droppable.map((n) => ({
                      value: String(n),
                      label: `Semester ${n}`,
                    })),
                  ]}
                />
                <TextInput
                  label="Academic year"
                  required
                  placeholder="2025-26"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.currentTarget.value)}
                />
              </>
            )}
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
                {action.dismiss ?? "Cancel"}
              </Button>
              <Button
                color={action.color}
                onClick={submit}
                loading={loading}
                disabled={!ready}
              >
                {action.confirm}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
