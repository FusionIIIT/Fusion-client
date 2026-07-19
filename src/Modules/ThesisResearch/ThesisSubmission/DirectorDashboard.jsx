import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Tabs,
  Center,
  Loader,
  Table,
  Button,
  Alert,
  Badge,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import axios from "axios";
import DirectorPrioritiesPanel from "./DirectorPrioritiesPanel";
import { directorDashboardRoute } from "../../../routes/academicRoutes";

const ACTION_COLOR = {
  prioritize: "indigo",
};

export default function DirectorDashboard() {
  const [data, setData] = useState({ action_required: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("action_required");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication required");
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await axios.get(directorDashboardRoute, {
        headers: { Authorization: `Token ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setData(res.data || { action_required: [], history: [] });
    } catch (e) {
      if (axios.isCancel(e)) {
        setError(new Error("Request timeout. Please try again."));
      } else {
        setError(
          new Error(
            e.response?.data?.detail || e.message || "Failed to load dashboard",
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" aria-label="Loading dashboard data" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        withCloseButton
        onClose={() => setError(null)}
      >
        {error.message}
        <Button size="xs" variant="outline" onClick={fetchData} mt="sm">
          Retry
        </Button>
      </Alert>
    );
  }

  const actionRows = data.action_required.map((t) => (
    <tr key={t.id}>
      <td>{t.student_name || "N/A"}</td>
      <td>{t.student_roll || "N/A"}</td>
      <td>{t.title || "N/A"}</td>
      <td>
        <Badge color={ACTION_COLOR[t.action] || "gray"}>{t.action_label}</Badge>
      </td>
      <td>
        {t.waiting_since
          ? new Date(t.waiting_since).toLocaleDateString()
          : "N/A"}
      </td>
      <td>
        <Button
          size="xs"
          onClick={() => setSelected(t)}
          aria-label={`${t.action_label} for ${t.title}`}
        >
          {t.action_label}
        </Button>
      </td>
    </tr>
  ));

  const historyRows = data.history.map((t) => (
    <tr key={t.id}>
      <td>{t.student_name || "N/A"}</td>
      <td>{t.student_roll || "N/A"}</td>
      <td>{t.title || "N/A"}</td>
      <td>{t.status}</td>
      <td>
        <Button
          size="xs"
          variant="default"
          onClick={() => setSelected(t)}
          aria-label={`View details for ${t.title}`}
        >
          View Details
        </Button>
      </td>
    </tr>
  ));

  return (
    <Card shadow="sm" p="lg" withBorder>
      <Title order={3} mb="md" align="center">
        Director Dashboard
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="action_required">
            Action Required ({data.action_required.length})
          </Tabs.Tab>
          <Tabs.Tab value="history">History ({data.history.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="action_required" pt="xs">
          <Table
            highlightOnHover
            aria-label="Submissions awaiting Director action"
          >
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Roll No</th>
                <th scope="col">Title</th>
                <th scope="col">Action Needed</th>
                <th scope="col">Waiting Since</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>{actionRows}</tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="xs">
          <Table highlightOnHover aria-label="Processed submissions">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Roll No</th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>{historyRows}</tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {selected && (
        <DirectorPrioritiesPanel
          submission={selected}
          readOnly={activeTab !== "action_required"}
          onClose={() => {
            setSelected(null);
            fetchData();
          }}
        />
      )}
    </Card>
  );
}
