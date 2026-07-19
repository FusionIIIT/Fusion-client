import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  Checkbox,
  Button,
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
import {
  studentComprehensiveExamRoute,
  studentOptSubjectsRoute,
} from "../../../routes/academicRoutes";
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
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchExam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(studentComprehensiveExamRoute, {
        headers: authHeaders(),
      });
      setExam(res.data && res.data.id ? res.data : null);
      setSelectedSubjects([]);
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
  const canOptSubjects = attempt?.status === "subjects_ready";
  const floatedSubjects = attempt?.subjects || [];

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const handleOptSubjects = async () => {
    if (selectedSubjects.length !== 2) {
      showNotification({
        title: "Select 2 subjects",
        message: "You must select exactly 2 subjects for the written exam.",
        color: "yellow",
      });
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        studentOptSubjectsRoute(attempt.id),
        { subject_ids: selectedSubjects },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Submitted",
        message: "Subject selection sent to your supervisor for confirmation.",
        color: "green",
      });
      fetchExam();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
      {exam.status === "convener_rejected" && (
        <Alert color="red" mb="md" title="Rejected by Convener">
          {exam.convener_remarks || "Contact your supervisor for details."}
        </Alert>
      )}

      <Text fw={500} mb="xs">
        Examination Committee
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

          {attempt.status === "hod_rejected" && (
            <Alert color="red" mb="md" title="Subjects sent back by HOD">
              {attempt.hod_remarks || "Your supervisor will re-float subjects."}
            </Alert>
          )}

          {canOptSubjects ? (
            <Stack>
              <Text size="sm" c="dimmed">
                Select exactly 2 subjects for the written examination.
              </Text>
              {floatedSubjects.map((s) => (
                <Checkbox
                  key={s.id}
                  label={s.subject_name}
                  checked={selectedSubjects.includes(s.id)}
                  onChange={() => toggleSubject(s.id)}
                />
              ))}
              <Button
                onClick={handleOptSubjects}
                loading={submitting}
                disabled={selectedSubjects.length !== 2}
              >
                Submit Selection
              </Button>
            </Stack>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Opted</th>
                </tr>
              </thead>
              <tbody>
                {floatedSubjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.subject_name}</td>
                    <td>{s.selected_by_student ? "Yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {attempt.status === "subjects_ready" &&
            attempt.supervisor_confirmation_remarks && (
              <Alert color="red" mt="md" title="Supervisor sent selection back">
                {attempt.supervisor_confirmation_remarks}
              </Alert>
            )}

          {(attempt.status === "passed" || attempt.status === "failed") && (
            <Stack mt="md">
              <Text fw={500}>
                Result: {attempt.result === "passed" ? "Passed" : "Failed"}
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
