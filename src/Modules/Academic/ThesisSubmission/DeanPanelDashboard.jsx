import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Card,
  Title,
  Tabs,
  Center,
  Loader,
  Notification,
  Table,
  Button,
} from "@mantine/core";
import axios from "axios";
import DeanPanelReviewPanel from "./DeanPanelReviewPanel";
import { deanThesisPanelDashboardRoute } from "../../../routes/academicRoutes";

const ACTION_LABEL = {
  dean_panel_review: "Review Panel",
  dean_invite_pending: "Send Invitations",
};

export default function DeanPanelDashboard() {
  const [data, setData] = useState({ pending: [], processed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(deanThesisPanelDashboardRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setData(res.data || { pending: [], processed: [] });
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

  const list = activeTab === "pending" ? data.pending : data.processed;
  const rows = list.map((s) => (
    <tr key={s.id}>
      <td>{s.title}</td>
      <td>{s.status}</td>
      <td>
        <Button size="xs" onClick={() => setSelected(s)}>
          {ACTION_LABEL[s.status] || "View Details"}
        </Button>
      </td>
    </tr>
  ));

  return (
    <Container size="xl" mt="xl">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} align="center" mb="md">
          Dean - Thesis Examination Panel
        </Title>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="pending">
              Pending Approval ({data.pending.length})
            </Tabs.Tab>
            <Tabs.Tab value="processed">
              Processed ({data.processed.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pending" pt="xs">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="processed" pt="xs">
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
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
    </Container>
  );
}
