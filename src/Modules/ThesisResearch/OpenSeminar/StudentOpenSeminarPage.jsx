import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Table,
  Center,
  Loader,
  Group,
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
        </tbody>
      </Table>

      <Divider mb="md" />
      <Text fw={500} mb="xs">
        Attempts
      </Text>
      {[...seminar.attempts].reverse().map((a) => (
        <div key={a.id} style={{ marginBottom: 16 }}>
          <Group justify="space-between" mb={4}>
            <Text fw={500}>Attempt {a.attempt_number}</Text>
            <Badge color={ATTEMPT_STATUS_COLOR[a.status]}>
              {ATTEMPT_STATUS_LABEL[a.status] || a.status}
            </Badge>
          </Group>
          <Table striped highlightOnHover mb="sm">
            <tbody>
              <tr>
                <td>
                  <Text fw={500}>Proposed Date</Text>
                </td>
                <td>{a.proposed_date || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Committee</Text>
                </td>
                <td>
                  {a.committee.length === 0
                    ? "—"
                    : a.committee.map((m) => m.name).join(", ")}
                </td>
              </tr>
              {a.result && (
                <tr>
                  <td>
                    <Text fw={500}>Result</Text>
                  </td>
                  <td>
                    {a.result === "satisfactory"
                      ? "Satisfactory"
                      : "Not Satisfactory"}
                  </td>
                </tr>
              )}
              {a.committee_comments && (
                <tr>
                  <td>
                    <Text fw={500}>Comments</Text>
                  </td>
                  <td>{a.committee_comments}</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      ))}
    </Card>
  );
}
