import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  Center,
  Loader,
  Stack,
  Group,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import axios from "axios";
import { studentComprehensiveExamRoute } from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  ENTRY_QUALIFICATION_LABEL,
  authHeaders,
  currentAttempt,
} from "./comprehensiveExamShared";

export default function StudentComprehensiveExamPage() {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(studentComprehensiveExamRoute, {
        headers: authHeaders(),
      });
      setExam(res.data && res.data.id ? res.data : null);
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || "Failed to load comprehensive exam.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!exam) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Comprehensive Examination
        </Title>
        <Text c="dimmed">
          Your supervisor has not initiated a comprehensive examination for you
          yet.
        </Text>
      </Card>
    );
  }

  const attempt = currentAttempt(exam);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Comprehensive Examination</Title>
        <Badge color={EXAM_STATUS_COLOR[exam.status]} size="lg">
          {EXAM_STATUS_LABEL[exam.status] || exam.status}
        </Badge>
      </Group>

      <Table striped highlightOnHover mb="md">
        <tbody>
          <tr>
            <td>
              <Text fw={500}>Discipline</Text>
            </td>
            <td>{exam.student_discipline || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Semester</Text>
            </td>
            <td>{exam.semester_no ?? "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Thesis Title</Text>
            </td>
            <td>{exam.possible_thesis_title || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Supervisor</Text>
            </td>
            <td>{exam.supervisor?.name}</td>
          </tr>
          {exam.co_supervisor && (
            <tr>
              <td>
                <Text fw={500}>Co-Supervisor</Text>
              </td>
              <td>{exam.co_supervisor.name}</td>
            </tr>
          )}
          <tr>
            <td>
              <Text fw={500}>Proposed Date of Examination</Text>
            </td>
            <td>{exam.proposed_exam_date || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Entry Qualification</Text>
            </td>
            <td>{ENTRY_QUALIFICATION_LABEL[exam.entry_qualification]}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Credits Completed</Text>
            </td>
            <td>
              {exam.credits_completed} / {exam.required_credits} required
            </td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Current CPI</Text>
            </td>
            <td>{exam.current_cpi ?? "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Attempt</Text>
            </td>
            <td>
              {exam.current_attempt_number} / {exam.max_attempts}
            </td>
          </tr>
        </tbody>
      </Table>

      {exam.status === "academic_office_rejected" && (
        <Alert color="red" mb="md" title="Rejected by Academic Office">
          {exam.academic_office_remarks ||
            "Contact your supervisor for details."}
        </Alert>
      )}
      {exam.status === "dpgc_rejected" && (
        <Alert color="red" mb="md" title="Rejected by Convener (DPGC)">
          {exam.dpgc_remarks || "Contact your supervisor for details."}
        </Alert>
      )}

      <Text fw={500} mb="xs">
        Examination Committee (your RPC)
      </Text>
      <Table striped highlightOnHover mb="md">
        <thead>
          <tr>
            <th>Name</th>
            <th>Discipline</th>
          </tr>
        </thead>
        <tbody>
          {exam.committee.length === 0 && (
            <tr>
              <td colSpan={2}>
                <Text c="dimmed">Not yet constituted</Text>
              </td>
            </tr>
          )}
          {exam.committee.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.discipline}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {attempt && (
        <>
          <Divider mb="md" />
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Attempt {attempt.attempt_number}</Text>
            <Badge color={ATTEMPT_STATUS_COLOR[attempt.status]}>
              {ATTEMPT_STATUS_LABEL[attempt.status] || attempt.status}
            </Badge>
          </Group>

          <Text size="sm" mb="md">
            <b>Date of Examination:</b> {attempt.exam_date || "Not yet set"}
          </Text>

          {attempt.pgcs_remarks && attempt.status === "rpc_pending" && (
            <Alert color="red" mb="md" title="Sent back by Convener (PGCS)">
              {attempt.pgcs_remarks}
            </Alert>
          )}

          {(attempt.status === "passed" || attempt.status === "failed") && (
            <Stack mt="md">
              <Text fw={500}>
                Candidate&apos;s Performance in Examination:{" "}
                {attempt.result === "passed" ? "Passed" : "Failed"}
              </Text>
              {attempt.fundamentals_comment && (
                <Text size="sm">
                  <b>Fundamentals:</b> {attempt.fundamentals_comment}
                </Text>
              )}
              {attempt.problem_identification_comment && (
                <Text size="sm">
                  <b>Problem Identification:</b>{" "}
                  {attempt.problem_identification_comment}
                </Text>
              )}
              {attempt.plan_of_work_comment && (
                <Text size="sm">
                  <b>Plan of Work:</b> {attempt.plan_of_work_comment}
                </Text>
              )}
              {attempt.suggestions_comment && (
                <Text size="sm">
                  <b>Suggestions:</b> {attempt.suggestions_comment}
                </Text>
              )}
              {attempt.additional_literature_comment && (
                <Text size="sm">
                  <b>Additional Literature:</b>{" "}
                  {attempt.additional_literature_comment}
                </Text>
              )}
            </Stack>
          )}
        </>
      )}
    </Card>
  );
}
