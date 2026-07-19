// src/components/thesis/SupervisorDashboard.jsx

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
import SupervisorAssignmentPanel from "./SupervisorAssignmentPanel";
import { supervisorDashboardRouteThesisSubmission } from "../../../routes/academicRoutes";

const ACTION_COLOR = {
  assign_examiners: "yellow",
  revise_panel: "red",
};

export default function SupervisorDashboardSub() {
  const [data, setData] = useState({ action_required: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("action_required");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(supervisorDashboardRouteThesisSubmission, {
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

  const actionRows = data.action_required.map((t) => (
    <tr key={t.id}>
      <td>{t.student_name || "N/A"}</td>
      <td>{t.student_roll || "N/A"}</td>
      <td>{t.title}</td>
      <td>
        <Badge color={ACTION_COLOR[t.action] || "gray"}>{t.action_label}</Badge>
      </td>
      <td>
        {t.waiting_since
          ? new Date(t.waiting_since).toLocaleDateString()
          : "N/A"}
      </td>
      <td>
        <Button size="xs" onClick={() => setSelected(t)}>
          {t.action_label}
        </Button>
      </td>
    </tr>
  ));

  const historyRows = data.history.map((t) => (
    <tr key={t.id}>
      <td>{t.student_name || "N/A"}</td>
      <td>{t.student_roll || "N/A"}</td>
      <td>{t.title}</td>
      <td>{t.status}</td>
      <td>
        <Button size="xs" variant="default" onClick={() => setSelected(t)}>
          View Details
        </Button>
      </td>
    </tr>
  ));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} align="center" mb="md">
        Supervisor Dashboard
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
        <SupervisorAssignmentPanel
          submission={selected}
          readOnly={selected.status !== "submitted"}
          onClose={() => {
            setSelected(null);
            fetchData();
          }}
        />
      )}
    </Card>
  );
}
