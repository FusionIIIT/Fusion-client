import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Tabs,
  Table,
  Button,
  Center,
  Loader,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import {
  hodDpgcComprehensiveExamDashboardRoute,
  hodPgcsComprehensiveExamDashboardRoute,
} from "../../../routes/academicRoutes";
import { authHeaders, currentAttempt } from "./comprehensiveExamShared";
import HODDpgcApproveModal from "./HODDpgcApproveModal";
import HODPgcsReviewModal from "./HODPgcsReviewModal";

export default function HODComprehensiveExamDashboard() {
  const [dpgcPending, setDpgcPending] = useState([]);
  const [pgcsPending, setPgcsPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dpgcSel, setDpgcSel] = useState(null);
  const [pgcsSel, setPgcsSel] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, pRes] = await Promise.all([
        axios.get(hodDpgcComprehensiveExamDashboardRoute, {
          headers: authHeaders(),
        }),
        axios.get(hodPgcsComprehensiveExamDashboardRoute, {
          headers: authHeaders(),
        }),
      ]);
      setDpgcPending(dRes.data.pending || []);
      setPgcsPending(pRes.data.pending || []);
      const dpgcHistory = (dRes.data.history || []).map((e) => ({
        ...e,
        stage: "DPGC",
      }));
      const pgcsHistory = (pRes.data.history || []).map((e) => ({
        ...e,
        stage: "PGCS",
      }));
      setHistory(
        [...dpgcHistory, ...pgcsHistory].sort(
          (a, b) => new Date(b.decided_at) - new Date(a.decided_at),
        ),
      );
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
    setDpgcSel(null);
    setPgcsSel(null);
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
        Comprehensive Exam — Convener (DPGC / PGCS)
      </Title>

      <Tabs defaultValue="dpgc">
        <Tabs.List>
          <Tabs.Tab value="dpgc">
            DPGC Approvals ({dpgcPending.length})
          </Tabs.Tab>
          <Tabs.Tab value="pgcs">PGCS Reviews ({pgcsPending.length})</Tabs.Tab>
          <Tabs.Tab value="history">History ({history.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dpgc" pt="md">
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
              {dpgcPending.length === 0 && (
                <tr>
                  <td colSpan={4}>No exams pending DPGC approval.</td>
                </tr>
              )}
              {dpgcPending.map((e) => (
                <tr key={e.id}>
                  <td>{e.student_roll}</td>
                  <td>{e.student_name}</td>
                  <td>{e.supervisor?.name}</td>
                  <td>
                    <Button size="xs" onClick={() => setDpgcSel(e)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="pgcs" pt="md">
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
              {pgcsPending.length === 0 && (
                <tr>
                  <td colSpan={4}>No attempts pending PGCS review.</td>
                </tr>
              )}
              {pgcsPending.map((e) => (
                <tr key={e.id}>
                  <td>{e.student_roll}</td>
                  <td>{e.student_name}</td>
                  <td>{currentAttempt(e)?.attempt_number}</td>
                  <td>
                    <Button size="xs" onClick={() => setPgcsSel(e)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="history" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Stage</th>
                <th>Decision</th>
                <th>Remarks</th>
                <th>Decided By</th>
                <th>Decided At</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={7}>No decisions recorded yet.</td>
                </tr>
              )}
              {history.map((e) => (
                <tr key={`${e.stage}-${e.id}`}>
                  <td>{e.student_roll}</td>
                  <td>{e.student_name}</td>
                  <td>{e.stage}</td>
                  <td>
                    <Badge color={e.decision === "Approved" ? "green" : "red"}>
                      {e.decision}
                    </Badge>
                  </td>
                  <td>{e.remarks || "—"}</td>
                  <td>{e.decided_by || "—"}</td>
                  <td>
                    {e.decided_at
                      ? new Date(e.decided_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {dpgcSel && (
        <HODDpgcApproveModal
          exam={dpgcSel}
          onClose={() => setDpgcSel(null)}
          refresh={handleRefresh}
        />
      )}
      {pgcsSel && (
        <HODPgcsReviewModal
          exam={pgcsSel}
          onClose={() => setPgcsSel(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
