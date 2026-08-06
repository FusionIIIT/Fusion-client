import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
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
  supervisorOpenSeminarDashboardRoute,
  rpcOpenSeminarListRoute,
  rpcOpenSeminarFinalizeRoute,
} from "../../../routes/academicRoutes";
import {
  SEMINAR_STATUS_LABEL,
  SEMINAR_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  isAttemptReadyToForward,
} from "./openSeminarShared";
import SupervisorProposeOpenSeminarModal from "./SupervisorProposeOpenSeminarModal";
import SupervisorOpenSeminarModal from "./SupervisorOpenSeminarModal";

// Being a student's Supervisor already makes you one of their RPC members
// (the supervisor is auto-added to CommitteeMember) -- so this is two tabs,
// not two roles: "Supervisor" for seminars you supervise (propose/manage --
// the Manage modal already shows the RPC panel inline since you're on the
// committee too), and "RPC Member" for every attempt you sit on the
// committee for, including students supervised by someone else.
export default function SupervisorOpenSeminarDashboard() {
  const [theses, setTheses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [rpcAttempts, setRpcAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposingThesis, setProposingThesis] = useState(null);
  const [managing, setManaging] = useState(null);
  const [forwardingId, setForwardingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [thesisRes, seminarRes, rpcRes] = await Promise.all([
        axios.get(supervisorDashboardRoute, { headers: authHeaders() }),
        axios.get(supervisorOpenSeminarDashboardRoute, {
          headers: authHeaders(),
        }),
        axios.get(rpcOpenSeminarListRoute, { headers: authHeaders() }),
      ]);
      setTheses([
        ...(thesisRes.data.pending || []),
        ...(thesisRes.data.forwarded || []),
      ]);
      setSeminars(seminarRes.data.seminars || []);
      setRpcAttempts([
        ...(rpcRes.data.pending || []),
        ...(rpcRes.data.history || []),
      ]);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load Open Seminars.",
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
          rpcOpenSeminarFinalizeRoute(attemptId),
          {},
          { headers: authHeaders() },
        );
        showNotification({
          title: "Forwarded",
          message: "Sent to Convener (DPGC) for review.",
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

  // A supervisor is always on the committee too, so cross-reference the RPC
  // list to show the same Consent/Consented state on the Supervisor tab's
  // action button whenever the current attempt is still awaiting consent.
  const supervisorRows = useMemo(() => {
    const seminarByRoll = new Map(seminars.map((s) => [s.student_roll, s]));
    const rpcByKey = new Map(
      rpcAttempts.map((a) => [`${a.seminar_id}:${a.attempt_number}`, a]),
    );
    return theses.map((t) => {
      const seminar = seminarByRoll.get(t.student_roll) || null;
      let rpcEntry = null;
      if (seminar) {
        const curAttempt = seminar.attempts.find(
          (a) => a.attempt_number === seminar.current_attempt_number,
        );
        if (curAttempt?.status === "rpc_pending") {
          rpcEntry =
            rpcByKey.get(`${seminar.id}:${seminar.current_attempt_number}`) ||
            null;
        }
      }
      return { thesis: t, seminar, rpcEntry };
    });
  }, [theses, seminars, rpcAttempts]);

  // A student already handled from the Supervisor tab shouldn't also show
  // up in RPC Member.
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
      <Title order={3} mb="md">
        Open Seminars
      </Title>

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
                <th>Thesis Title</th>
                <th>Status</th>
                <th>Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {supervisorRows.length === 0 && (
                <tr>
                  <td colSpan={6}>You have no thesis students yet.</td>
                </tr>
              )}
              {supervisorRows.map(({ thesis, seminar, rpcEntry }) => (
                <tr key={thesis.id}>
                  <td>{thesis.student_roll}</td>
                  <td>{thesis.student_name}</td>
                  <td>
                    {seminar?.possible_thesis_title ||
                      thesis.research_theme ||
                      "—"}
                  </td>
                  <td>
                    {seminar ? (
                      <Badge color={SEMINAR_STATUS_COLOR[seminar.status]}>
                        {SEMINAR_STATUS_LABEL[seminar.status] || seminar.status}
                      </Badge>
                    ) : (
                      <Badge color="gray">Not Proposed</Badge>
                    )}
                  </td>
                  <td>{seminar ? seminar.current_attempt_number : "—"}</td>
                  <td>
                    {seminar ? (
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
                              seminarId: seminar.id,
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
                        Propose Open Seminar
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
                    You are not on any Open Seminar committee yet.
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
                              seminarId: a.seminar_id,
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
        <SupervisorProposeOpenSeminarModal
          thesis={proposingThesis}
          onClose={() => setProposingThesis(null)}
          refresh={handleRefresh}
        />
      )}
      {managing && (
        <SupervisorOpenSeminarModal
          seminarId={managing.seminarId}
          viewerIsSupervisor={managing.viewerIsSupervisor}
          onClose={() => setManaging(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
