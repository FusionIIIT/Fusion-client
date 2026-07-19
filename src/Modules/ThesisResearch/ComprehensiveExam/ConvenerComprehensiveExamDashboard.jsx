import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Tabs,
  Table,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { convenerComprehensiveExamDashboardRoute } from "../../../routes/academicRoutes";
import { authHeaders } from "./comprehensiveExamShared";
import ConvenerApproveCommitteeModal from "./ConvenerApproveCommitteeModal";
import ConvenerResultModal from "./ConvenerResultModal";

export default function ConvenerComprehensiveExamDashboard() {
  const [data, setData] = useState({
    pending_committee: [],
    pending_reports: [],
  });
  const [loading, setLoading] = useState(true);
  const [committeeSel, setCommitteeSel] = useState(null);
  const [reportSel, setReportSel] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(convenerComprehensiveExamDashboardRoute, {
        headers: authHeaders(),
      });
      setData(res.data || { pending_committee: [], pending_reports: [] });
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load dashboard.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setCommitteeSel(null);
    setReportSel(null);
    fetchData();
  };

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Comprehensive Exam — Convener
      </Title>

      <Tabs defaultValue="committee">
        <Tabs.List>
          <Tabs.Tab value="committee">
            Committee Approvals ({data.pending_committee.length})
          </Tabs.Tab>
          <Tabs.Tab value="reports">
            Result Reports ({data.pending_reports.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="committee" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Supervisor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.pending_committee.length === 0 && (
                <tr>
                  <td colSpan={4}>No committees pending approval.</td>
                </tr>
              )}
              {data.pending_committee.map((e) => (
                <tr key={e.id}>
                  <td>{e.student_roll}</td>
                  <td>{e.student_name}</td>
                  <td>{e.supervisor?.name}</td>
                  <td>
                    <Button size="xs" onClick={() => setCommitteeSel(e)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="reports" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.pending_reports.length === 0 && (
                <tr>
                  <td colSpan={4}>No result reports pending.</td>
                </tr>
              )}
              {data.pending_reports.map((e) => (
                <tr key={e.id}>
                  <td>{e.student_roll}</td>
                  <td>{e.student_name}</td>
                  <td>
                    {e.current_attempt_number} / {e.max_attempts}
                  </td>
                  <td>
                    <Button size="xs" onClick={() => setReportSel(e)}>
                      Submit Result
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {committeeSel && (
        <ConvenerApproveCommitteeModal
          exam={committeeSel}
          onClose={() => setCommitteeSel(null)}
          refresh={handleRefresh}
        />
      )}
      {reportSel && (
        <ConvenerResultModal
          exam={reportSel}
          onClose={() => setReportSel(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
