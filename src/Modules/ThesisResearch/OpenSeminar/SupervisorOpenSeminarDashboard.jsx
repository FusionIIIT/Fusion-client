import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Title,
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
} from "../../../routes/academicRoutes";
import {
  SEMINAR_STATUS_LABEL,
  SEMINAR_STATUS_COLOR,
  authHeaders,
} from "./openSeminarShared";
import SupervisorProposeOpenSeminarModal from "./SupervisorProposeOpenSeminarModal";
import SupervisorOpenSeminarModal from "./SupervisorOpenSeminarModal";

export default function SupervisorOpenSeminarDashboard() {
  const [theses, setTheses] = useState([]);
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposingThesis, setProposingThesis] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [thesisRes, seminarRes] = await Promise.all([
        axios.get(supervisorDashboardRoute, { headers: authHeaders() }),
        axios.get(supervisorOpenSeminarDashboardRoute, {
          headers: authHeaders(),
        }),
      ]);
      setTheses([
        ...(thesisRes.data.pending || []),
        ...(thesisRes.data.forwarded || []),
      ]);
      setSeminars(seminarRes.data.seminars || []);
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
    setSelectedId(null);
    fetchData();
  }, [fetchData]);

  const rows = useMemo(() => {
    const seminarByRoll = new Map(seminars.map((s) => [s.student_roll, s]));
    return theses.map((t) => ({
      thesis: t,
      seminar: seminarByRoll.get(t.student_roll) || null,
    }));
  }, [theses, seminars]);

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
          {rows.length === 0 && (
            <tr>
              <td colSpan={5}>You have no thesis students yet.</td>
            </tr>
          )}
          {rows.map(({ thesis, seminar }) => (
            <tr key={thesis.id}>
              <td>{thesis.student_roll}</td>
              <td>{thesis.student_name}</td>
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
                  <Button size="xs" onClick={() => setSelectedId(seminar.id)}>
                    Manage
                  </Button>
                ) : (
                  <Button size="xs" onClick={() => setProposingThesis(thesis)}>
                    Propose Open Seminar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {proposingThesis && (
        <SupervisorProposeOpenSeminarModal
          thesis={proposingThesis}
          onClose={() => setProposingThesis(null)}
          refresh={handleRefresh}
        />
      )}
      {selectedId && (
        <SupervisorOpenSeminarModal
          seminarId={selectedId}
          onClose={() => setSelectedId(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
