import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Tabs,
  Button,
  Center,
  Loader,
  Table,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import {
  supervisorDashboardRoute,
  supervisorComprehensiveExamDashboardRoute,
  rpcComprehensiveExamListRoute,
  rpcComprehensiveExamFinalizeRoute,
} from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  isAttemptReadyToForward,
} from "./comprehensiveExamShared";
import SupervisorProposeExamModal from "./SupervisorProposeExamModal";
import SupervisorComprehensiveExamModal from "./SupervisorComprehensiveExamModal";

// Being a student's Supervisor already makes you one of their RPC members
// (the supervisor is auto-added to CommitteeMember) -- so this is two tabs,
// not two roles: "Supervisor" for exams you supervise (propose/manage --
// the Manage modal already shows the RPC panel inline since you're on the
// committee too), and "RPC Member" for every attempt you sit on the
// committee for, including students supervised by someone else.
export default function SupervisorComprehensiveExamDashboard() {
  const [theses, setTheses] = useState([]);
  const [exams, setExams] = useState([]);
  const [rpcAttempts, setRpcAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposingThesis, setProposingThesis] = useState(null);
  const [managing, setManaging] = useState(null);
  const [forwardingId, setForwardingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [thesisRes, examRes, rpcRes] = await Promise.all([
        axios.get(supervisorDashboardRoute, { headers: authHeaders() }),
        axios.get(supervisorComprehensiveExamDashboardRoute, {
          headers: authHeaders(),
        }),
        axios.get(rpcComprehensiveExamListRoute, { headers: authHeaders() }),
      ]);
      setTheses([
        ...(thesisRes.data.pending || []),
        ...(thesisRes.data.forwarded || []),
      ]);
      setExams(examRes.data.exams || []);
      setRpcAttempts([
        ...(rpcRes.data.pending || []),
        ...(rpcRes.data.history || []),
      ]);
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || "Failed to load comprehensive exams.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setProposingThesis(null);
    setManaging(null);
    fetchData();
  }, [fetchData]);

  const handleForward = useCallback(
    async (attemptId) => {
      setForwardingId(attemptId);
      try {
        await axios.post(
          rpcComprehensiveExamFinalizeRoute(attemptId),
          {},
          { headers: authHeaders() },
        );
        showNotification({
          title: "Forwarded",
          message: "Sent to Convener (PGCS) for review.",
          color: "green",
        });
        fetchData();
      } catch (e) {
        showNotification({
          title: "Error",
          message: e.response?.data?.error || "Forward failed",
          color: "red",
        });
      } finally {
        setForwardingId(null);
      }
    },
    [fetchData],
  );

  // A supervisor is always on the committee too (auto-added to
  // CommitteeMember), so cross-reference the RPC list to show the same
  // Consent/Consented state on the Supervisor tab's action button whenever
  // the current attempt is still awaiting the supervisor's own consent.
  const supervisorRows = useMemo(() => {
    const examByRoll = new Map(exams.map((e) => [e.student_roll, e]));
    const rpcByKey = new Map(
      rpcAttempts.map((a) => [`${a.exam_id}:${a.attempt_number}`, a]),
    );
    return theses.map((t) => {
      const exam = examByRoll.get(t.student_roll) || null;
      let rpcEntry = null;
      if (exam) {
        const curAttempt = exam.attempts.find(
          (a) => a.attempt_number === exam.current_attempt_number,
        );
        if (curAttempt?.status === "rpc_pending") {
          rpcEntry =
            rpcByKey.get(`${exam.id}:${exam.current_attempt_number}`) || null;
        }
      }
      return { thesis: t, exam, rpcEntry };
    });
  }, [theses, exams, rpcAttempts]);

  // A student already handled from the Supervisor tab shouldn't also show
  // up in RPC Member -- the Manage modal there already covers RPC review
  // inline since the supervisor is on the committee too.
  const rpcOnlyAttempts = useMemo(() => {
    const supervisedRolls = new Set(theses.map((t) => t.student_roll));
    return rpcAttempts.filter((a) => !supervisedRolls.has(a.student_roll));
  }, [theses, rpcAttempts]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Tabs defaultValue="supervisor">
        <Tabs.List>
          <Tabs.Tab value="supervisor">
            Supervisor ({supervisorRows.length})
          </Tabs.Tab>
          <Tabs.Tab value="rpc">RPC Member ({rpcOnlyAttempts.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="supervisor" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Status</th>
                <th>Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {supervisorRows.length === 0 && (
                <tr>
                  <td colSpan={5}>You have no thesis students yet.</td>
                </tr>
              )}
              {supervisorRows.map(({ thesis, exam, rpcEntry }) => (
                <tr key={thesis.id}>
                  <td>{thesis.student_roll}</td>
                  <td>{thesis.student_name}</td>
                  <td>
                    {exam ? (
                      <Badge color={EXAM_STATUS_COLOR[exam.status]}>
                        {EXAM_STATUS_LABEL[exam.status] || exam.status}
                      </Badge>
                    ) : (
                      <Badge color="gray">Not Proposed</Badge>
                    )}
                  </td>
                  <td>
                    {exam
                      ? `${exam.current_attempt_number} / ${exam.max_attempts}`
                      : "—"}
                  </td>
                  <td>
                    {exam ? (
                      rpcEntry && isAttemptReadyToForward(rpcEntry) ? (
                        <Button
                          size="xs"
                          color="green"
                          loading={forwardingId === rpcEntry.id}
                          onClick={() => handleForward(rpcEntry.id)}
                        >
                          Forward
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant={
                            rpcEntry?.my_consent_given ? "outline" : "filled"
                          }
                          onClick={() =>
                            setManaging({
                              examId: exam.id,
                              viewerIsSupervisor: true,
                            })
                          }
                        >
                          {rpcEntry
                            ? rpcEntry.my_consent_given
                              ? "Consented"
                              : "Consent"
                            : "Manage"}
                        </Button>
                      )
                    ) : (
                      <Button
                        size="xs"
                        onClick={() => setProposingThesis(thesis)}
                      >
                        Propose Exam
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="rpc" pt="md">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Status</th>
                <th>Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rpcOnlyAttempts.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    You are not on any comprehensive exam committee yet.
                  </td>
                </tr>
              )}
              {rpcOnlyAttempts.map((a) => {
                const ready = isAttemptReadyToForward(a);
                return (
                  <tr key={a.id}>
                    <td>{a.student_roll}</td>
                    <td>{a.student_name}</td>
                    <td>
                      <Badge
                        color={ready ? "blue" : ATTEMPT_STATUS_COLOR[a.status]}
                      >
                        {ready
                          ? "In Progress"
                          : ATTEMPT_STATUS_LABEL[a.status] || a.status}
                      </Badge>
                    </td>
                    <td>{a.attempt_number}</td>
                    <td>
                      {ready ? (
                        <Button
                          size="xs"
                          color="green"
                          loading={forwardingId === a.id}
                          onClick={() => handleForward(a.id)}
                        >
                          Forward
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant={
                            a.status === "rpc_pending" && a.my_consent_given
                              ? "outline"
                              : "filled"
                          }
                          onClick={() =>
                            setManaging({
                              examId: a.exam_id,
                              viewerIsSupervisor: false,
                            })
                          }
                        >
                          {a.status !== "rpc_pending"
                            ? "View"
                            : a.my_consent_given
                              ? "Consented"
                              : "Consent"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      {proposingThesis && (
        <SupervisorProposeExamModal
          thesis={proposingThesis}
          onClose={() => setProposingThesis(null)}
          refresh={handleRefresh}
        />
      )}
      {managing && (
        <SupervisorComprehensiveExamModal
          examId={managing.examId}
          viewerIsSupervisor={managing.viewerIsSupervisor}
          onClose={() => setManaging(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
