import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Tabs,
  Center,
  Loader,
  Notification,
  Table,
  Button,
  Badge,
} from "@mantine/core";
import axios from "axios";
import DeanPanelReviewPanel from "./DeanPanelReviewPanel";
import { deanThesisPanelDashboardRoute } from "../../../routes/academicRoutes";

const ACTION_COLOR = {
  approve_panel: "yellow",
  reconsider_panel: "red",
  send_invitations: "indigo",
};

export default function DeanPanelDashboard() {
  const [data, setData] = useState({ action_required: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("action_required");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(deanThesisPanelDashboardRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setData(res.data || { action_required: [], history: [] });
    } catch (e) {
      setError(e);
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
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return <Notification color="red">Error: {error.message}</Notification>;
  }

  const actionRows = data.action_required.map((s) => (
    <tr key={s.id}>
      <td>{s.student_name || "N/A"}</td>
      <td>{s.student_roll || "N/A"}</td>
      <td>{s.title}</td>
      <td>
        <Badge color={ACTION_COLOR[s.action] || "gray"}>{s.action_label}</Badge>
      </td>
      <td>
        {s.waiting_since
          ? new Date(s.waiting_since).toLocaleDateString()
          : "N/A"}
      </td>
      <td>
        <Button size="xs" onClick={() => setSelected(s)}>
          {s.action_label}
        </Button>
      </td>
    </tr>
  ));

  const historyRows = data.history.map((s) => (
    <tr key={s.id}>
      <td>{s.student_name || "N/A"}</td>
      <td>{s.student_roll || "N/A"}</td>
      <td>{s.title}</td>
      <td>{s.status_label || s.status}</td>
      <td>
        <Button size="xs" variant="default" onClick={() => setSelected(s)}>
          View Details
        </Button>
      </td>
    </tr>
  ));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md" ta="center">
        Dean - Thesis Examination Panel
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="action_required">
            Action Required ({data.action_required.length})
          </Tabs.Tab>
          <Tabs.Tab value="history">History ({data.history.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="action_required" pt="xs">
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Title</th>
                <th>Action Needed</th>
                <th>Waiting Since</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{actionRows}</tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="xs">
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{historyRows}</tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {selected && (
        <DeanPanelReviewPanel
          submission={selected}
          onClose={() => {
            setSelected(null);
            fetchData();
          }}
        />
      )}
    </Card>
  );
}
