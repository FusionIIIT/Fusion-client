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
  hodDpgcOpenSeminarDashboardRoute,
  hodReviewOpenSeminarDashboardRoute,
} from "../../../routes/academicRoutes";
import { authHeaders, currentAttempt } from "./openSeminarShared";
import HODDpgcApproveOpenSeminarModal from "./HODDpgcApproveOpenSeminarModal";
import HODReviewOpenSeminarModal from "./HODReviewOpenSeminarModal";

export default function HODOpenSeminarDashboard() {
  const [earlyPending, setEarlyPending] = useState([]);
  const [postRpcPending, setPostRpcPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [earlySel, setEarlySel] = useState(null);
  const [postRpcSel, setPostRpcSel] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.all([
        axios.get(hodDpgcOpenSeminarDashboardRoute, {
          headers: authHeaders(),
        }),
        axios.get(hodReviewOpenSeminarDashboardRoute, {
          headers: authHeaders(),
        }),
      ]);
      setEarlyPending(dRes.data.pending || []);
      setPostRpcPending(rRes.data.pending || []);
      const earlyHistory = (dRes.data.history || []).map((s) => ({
        ...s,
        stage: "Early Review",
      }));
      const postRpcHistory = (rRes.data.history || []).map((s) => ({
        ...s,
        stage: "Post-RPC Review",
      }));
      setHistory(
        [...earlyHistory, ...postRpcHistory].sort(
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
    setEarlySel(null);
    setPostRpcSel(null);
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
        Open Seminar — Convener (DPGC)
      </Title>

      <Tabs defaultValue="early">
        <Tabs.List>
          <Tabs.Tab value="early">
            Early Review ({earlyPending.length})
          </Tabs.Tab>
          <Tabs.Tab value="postRpc">
            Post-RPC Review ({postRpcPending.length})
          </Tabs.Tab>
          <Tabs.Tab value="history">History ({history.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="early" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Thesis Title</th>
                <th>Supervisor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {earlyPending.length === 0 && (
                <tr>
                  <td colSpan={5}>No seminars pending early review.</td>
                </tr>
              )}
              {earlyPending.map((s) => (
                <tr key={s.id}>
                  <td>{s.student_roll}</td>
                  <td>{s.student_name}</td>
                  <td>{s.possible_thesis_title || "—"}</td>
                  <td>{s.supervisor?.name}</td>
                  <td>
                    <Button size="xs" onClick={() => setEarlySel(s)}>
                      Forward
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="postRpc" pt="md">
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
              {postRpcPending.length === 0 && (
                <tr>
                  <td colSpan={4}>No attempts pending post-RPC review.</td>
                </tr>
              )}
              {postRpcPending.map((s) => (
                <tr key={s.id}>
                  <td>{s.student_roll}</td>
                  <td>{s.student_name}</td>
                  <td>{currentAttempt(s)?.attempt_number}</td>
                  <td>
                    <Button size="xs" onClick={() => setPostRpcSel(s)}>
                      Forward
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
              {history.map((s) => (
                <tr key={`${s.stage}-${s.id}`}>
                  <td>{s.student_roll}</td>
                  <td>{s.student_name}</td>
                  <td>{s.stage}</td>
                  <td>
                    <Badge color={s.decision === "Approved" ? "green" : "red"}>
                      {s.decision}
                    </Badge>
                  </td>
                  <td>{s.remarks || "—"}</td>
                  <td>{s.decided_by || "—"}</td>
                  <td>
                    {s.decided_at
                      ? new Date(s.decided_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {earlySel && (
        <HODDpgcApproveOpenSeminarModal
          seminar={earlySel}
          onClose={() => setEarlySel(null)}
          refresh={handleRefresh}
        />
      )}
      {postRpcSel && (
        <HODReviewOpenSeminarModal
          seminar={postRpcSel}
          onClose={() => setPostRpcSel(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
