import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Button,
  Center,
  Loader,
  Notification,
  Anchor,
  Textarea,
  Group,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import {
  thesisRevisionRpcListRoute,
  thesisRevisionRpcConsentRoute,
} from "../../../routes/academicRoutes";

export default function ThesisRevisionRPCDashboard() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarksById, setRemarksById] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(thesisRevisionRpcListRoute, {
        headers: authHeaders(),
      });
      setRounds(res.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConsent = async (roundId) => {
    setSubmittingId(roundId);
    try {
      await axios.post(
        thesisRevisionRpcConsentRoute,
        { round_id: roundId, remarks: remarksById[roundId] || "" },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Success",
        message: "Consent recorded.",
        color: "teal",
        icon: <IconCheck />,
      });
      fetchData();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return <Notification color="red">Error: {error.message}</Notification>;
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Thesis Revision - RPC Consent
      </Title>

      {rounds.length === 0 ? (
        <Text c="dimmed" ta="center">
          No thesis revisions are currently awaiting your consent.
        </Text>
      ) : (
        <Table striped highlightOnHover verticalSpacing="md">
          <thead>
            <tr>
              <th>Student</th>
              <th>Thesis</th>
              <th>Round</th>
              <th>Revised Thesis</th>
              <th>Remarks</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr key={r.round_id}>
                <td>{r.student_name}</td>
                <td>{r.thesis_title}</td>
                <td>{r.round_number}</td>
                <td>
                  {r.revised_thesis_url ? (
                    <Anchor
                      href={r.revised_thesis_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </Anchor>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Not uploaded yet
                    </Text>
                  )}
                </td>
                <td>
                  <Textarea
                    placeholder="Optional remarks"
                    autosize
                    minRows={1}
                    disabled={r.my_consent_given}
                    value={remarksById[r.round_id] || ""}
                    onChange={(e) =>
                      setRemarksById((prev) => ({
                        ...prev,
                        [r.round_id]: e.target.value,
                      }))
                    }
                  />
                </td>
                <td>
                  <Badge color={r.my_consent_given ? "teal" : "gray"}>
                    {r.my_consent_given ? "Consented" : "Pending"}
                  </Badge>
                </td>
                <td>
                  <Group>
                    <Button
                      size="xs"
                      disabled={r.my_consent_given || !r.revised_thesis_url}
                      loading={submittingId === r.round_id}
                      onClick={() => handleConsent(r.round_id)}
                    >
                      Give Consent
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
