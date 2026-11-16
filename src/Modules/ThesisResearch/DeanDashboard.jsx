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
import FusionTable from "../../components/FusionTable";
import DeanReviewModal from "./DeanReviewModal";
import DeanThesisChangeRequestModal from "./DeanThesisChangeRequestModal";
import DeanCommitteeChangeModal from "./DeanCommitteeChangeModal";
import {
  deanDashboardRoute,
  deanThesisChangeRequestDashboardRoute,
  deanCommitteeChangeDashboardRoute,
} from "../../routes/academicRoutes";

export default function DeanDashboard() {
  const [data, setData] = useState({ pending: [], approved: [], rejected: [] });
  const [changeRequests, setChangeRequests] = useState([]);
  const [committeeChangeRequests, setCommitteeChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sel, setSel] = useState(null);
  const [selChange, setSelChange] = useState(null);
  const [selCommitteeChange, setSelCommitteeChange] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

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

      const [res, crRes, ccRes] = await Promise.all([
        axios.get(deanDashboardRoute, { headers, signal: controller.signal }),
        axios.get(deanThesisChangeRequestDashboardRoute, { headers }),
        axios.get(deanCommitteeChangeDashboardRoute, { headers }),
      ]);

      clearTimeout(timeoutId);
      setData(res.data || { pending: [], approved: [], rejected: [] });
      setChangeRequests(crRes.data.pending || []);
      setCommitteeChangeRequests(ccRes.data.pending || []);
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

  const cols = useMemo(
    () => ["Roll No", "Student", "Programme", "Theme", "Action"],
    [],
  );

  const makeRows = useCallback(
    (list) =>
      list.map((t) => ({
        "Roll No": t.student_roll || "N/A",
        Student: t.student_name || "N/A",
        Programme:
          t.programme_category === "PHD"
            ? "PhD"
            : t.programme_category || "N/A",
        Theme: t.research_theme ? `${t.research_theme.slice(0, 30)}...` : "N/A",
        Action: (
          <Button
            size="xs"
            onClick={() => setSel(t)}
            aria-label={`Review thesis for ${t.student_name}`}
          >
            Review
          </Button>
        ),
      })),
    [],
  );

  const changeCols = useMemo(() => ["Roll No", "Student", "Action"], []);

  const makeChangeRows = useCallback(
    (list, setSelected = setSelChange) =>
      list.map((cr) => ({
        "Roll No": cr.student_roll || "N/A",
        Student: cr.student_name || "N/A",
        Action: (
          <Button size="xs" onClick={() => setSelected(cr)}>
            Review
          </Button>
        ),
      })),
    [],
  );

  const handleRefresh = useCallback(() => {
    setSel(null);
    setSelChange(null);
    setSelCommitteeChange(null);
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
        Dean Dashboard
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="pending">{`Pending (${data.pending.length})`}</Tabs.Tab>
          <Tabs.Tab value="approved">{`Approved (${data.approved.length})`}</Tabs.Tab>
          <Tabs.Tab value="rejected">{`Rejected (${data.rejected.length})`}</Tabs.Tab>
          <Tabs.Tab value="changeRequests">
            {`Change Requests (${changeRequests.length})`}
          </Tabs.Tab>
          <Tabs.Tab value="committeeChangeRequests">
            {`Committee Changes (${committeeChangeRequests.length})`}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pending" pt="xs">
          <FusionTable columnNames={cols} elements={makeRows(data.pending)} />
        </Tabs.Panel>
        <Tabs.Panel value="approved" pt="xs">
          <FusionTable columnNames={cols} elements={makeRows(data.approved)} />
        </Tabs.Panel>
        <Tabs.Panel value="rejected" pt="xs">
          <FusionTable columnNames={cols} elements={makeRows(data.rejected)} />
        </Tabs.Panel>
        <Tabs.Panel value="changeRequests" pt="xs">
          <FusionTable
            columnNames={changeCols}
            elements={makeChangeRows(changeRequests)}
          />
        </Tabs.Panel>
        <Tabs.Panel value="committeeChangeRequests" pt="xs">
          <FusionTable
            columnNames={changeCols}
            elements={makeChangeRows(
              committeeChangeRequests,
              setSelCommitteeChange,
            )}
          />
        </Tabs.Panel>
      </Tabs>

      {sel && (
        <DeanReviewModal
          thesis={sel}
          onClose={() => setSel(null)}
          refresh={handleRefresh}
        />
      )}
      {selChange && (
        <DeanThesisChangeRequestModal
          request={selChange}
          onClose={() => setSelChange(null)}
          refresh={handleRefresh}
        />
      )}
      {selCommitteeChange && (
        <DeanCommitteeChangeModal
          request={selCommitteeChange}
          onClose={() => setSelCommitteeChange(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
