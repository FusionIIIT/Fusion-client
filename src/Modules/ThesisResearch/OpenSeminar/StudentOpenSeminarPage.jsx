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
import axios from "axios";
import { studentOpenSeminarRoute } from "../../../routes/academicRoutes";
import {
  SEMINAR_STATUS_LABEL,
  SEMINAR_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  currentAttempt,
} from "./openSeminarShared";

export default function StudentOpenSeminarPage() {
  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSeminar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(studentOpenSeminarRoute, {
        headers: authHeaders(),
      });
      setSeminar(res.data && res.data.id ? res.data : null);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load Open Seminar.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeminar();
  }, [fetchSeminar]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!seminar) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Open Seminar
        </Title>
        <Text c="dimmed">
          Your supervisor has not initiated an Open Seminar for you yet.
        </Text>
      </Card>
    );
  }

  const attempt = currentAttempt(seminar);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Open Seminar</Title>
        <Badge color={SEMINAR_STATUS_COLOR[seminar.status]} size="lg">
          {SEMINAR_STATUS_LABEL[seminar.status] || seminar.status}
        </Badge>
      </Group>

      <Table striped highlightOnHover mb="md">
        <tbody>
          <tr>
            <td>
              <Text fw={500}>Discipline</Text>
            </td>
            <td>{seminar.student_discipline || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Semester</Text>
            </td>
            <td>{seminar.semester_no ?? "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Thesis Title</Text>
            </td>
            <td>{seminar.possible_thesis_title || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Supervisor</Text>
            </td>
            <td>{seminar.supervisor?.name}</td>
          </tr>
          {seminar.co_supervisor && (
            <tr>
              <td>
                <Text fw={500}>Co-Supervisor</Text>
              </td>
              <td>{seminar.co_supervisor.name}</td>
            </tr>
          )}
          <tr>
            <td>
              <Text fw={500}>Proposed Date</Text>
            </td>
            <td>{seminar.proposed_date || "—"}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>
                Credits (Course Work / Progress Seminar / Thesis Research /
                Teaching)
              </Text>
            </td>
            <td>
              {seminar.course_work_credits} / {seminar.progress_seminar_credits}{" "}
              / {seminar.thesis_research_credits} / {seminar.teaching_credits} ={" "}
              {seminar.total_credits} total
            </td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>Semesters Completed</Text>
            </td>
            <td>{seminar.semesters_completed}</td>
          </tr>
          <tr>
            <td>
              <Text fw={500}>RPC Recommended Open Seminar?</Text>
            </td>
            <td>{seminar.rpc_recommended_open_seminar ? "Yes" : "No"}</td>
          </tr>
        </tbody>
      </Table>

      {seminar.status === "hod_rejected" && (
        <Alert color="red" mb="md" title="Rejected by Convener (DPGC)">
          {seminar.hod_remarks || "Contact your supervisor for details."}
        </Alert>
      )}
      {seminar.status === "dean_rejected" && (
        <Alert color="red" mb="md" title="Rejected by Dean Academic">
          {seminar.dean_remarks || "Contact your supervisor for details."}
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
          {seminar.committee.length === 0 && (
            <tr>
              <td colSpan={2}>
                <Text c="dimmed">Not yet constituted</Text>
              </td>
            </tr>
          )}
          {seminar.committee.map((m) => (
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
            <b>Date of Seminar:</b> {attempt.seminar_date || "Not yet set"}
          </Text>

          {attempt.hod_review_remarks && attempt.status === "rpc_pending" && (
            <Alert color="red" mb="md" title="Sent back by Convener (DPGC)">
              {attempt.hod_review_remarks}
            </Alert>
          )}

          {(attempt.status === "satisfactory" ||
            attempt.status === "not_satisfactory") && (
            <Stack mt="md">
              <Text fw={500}>
                Result:{" "}
                {attempt.result === "satisfactory"
                  ? "Satisfactory"
                  : "Not Satisfactory"}
              </Text>
              {attempt.committee_comments && (
                <Text size="sm">{attempt.committee_comments}</Text>
              )}
            </Stack>
          )}
        </>
      )}

      {seminar.attempts.length > 1 && (
        <>
          <Divider my="md" label="Previous Attempts" />
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {seminar.attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.attempt_number}</td>
                  <td>{ATTEMPT_STATUS_LABEL[a.status] || a.status}</td>
                  <td>{a.result || "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Card>
  );
}
