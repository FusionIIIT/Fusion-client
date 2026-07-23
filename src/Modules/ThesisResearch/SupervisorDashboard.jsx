import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
  Tabs,
  Center,
  Loader,
  Button,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import axios from "axios";
import FusionTable from "./FusionTable";
import SupervisorReviewModal from "./SupervisorReviewModal";
import { supervisorDashboardRoute } from "../../routes/academicRoutes";

export default function SupervisorDashboard() {
  const [data, setData] = useState({ pending: [], forwarded: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(new Error("Authentication required. Please log in."));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Token ${token}` };
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await axios.get(supervisorDashboardRoute, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setData(res.data || { pending: [], forwarded: [] });
      setError(null);
    } catch (e) {
      if (axios.isCancel(e)) {
        setError(new Error("Request timeout. Please try again."));
      } else if (e.response?.status === 401) {
        setError(new Error("Session expired. Please log in again."));
      } else if (e.response?.status === 403) {
        setError(new Error("Access denied. Insufficient permissions."));
      } else {
        setError(
          new Error(
            e.response?.data?.detail ||
              e.message ||
              "Failed to load dashboard data",
          ),
        );
      }
      showNotification({
        title: "Error",
        message: e.response?.data?.detail || e.message || "Failed to load data",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columnNames = useMemo(
    () => ["Roll No", "Student", "Theme", "Action"],
    [],
  );

  const makeRows = useCallback(
    (list) =>
      list.map((t) => ({
        "Roll No": t.student_roll || "N/A",
        Student: t.student_name || "N/A",
        Theme: t.research_theme || "N/A",
        Action: (
          <Button
            size="xs"
            onClick={() => setSelected(t)}
            aria-label={`${t.my_consent_given ? "Review" : "Consent to"} thesis for ${t.student_name}`}
          >
            {t.my_consent_given ? "Review" : "Consent"}
          </Button>
        ),
      })),
    [],
  );

  const handleRefresh = useCallback(() => {
    setSelected(null);
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

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md" ta="center">
        Supervisor Dashboard
      </Title>

      <Tabs defaultValue="pending">
        <Tabs.List>
          <Tabs.Tab value="pending">Pending ({data.pending.length})</Tabs.Tab>
          <Tabs.Tab value="forwarded">
            Forwarded ({data.forwarded.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pending" pt="md">
          <FusionTable
            columnNames={columnNames}
            elements={makeRows(data.pending)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="forwarded" pt="md">
          <FusionTable
            columnNames={columnNames}
            elements={makeRows(data.forwarded)}
          />
        </Tabs.Panel>
      </Tabs>

      {selected && (
        <SupervisorReviewModal
          thesis={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
