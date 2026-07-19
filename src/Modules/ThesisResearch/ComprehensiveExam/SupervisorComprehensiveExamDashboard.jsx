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
  supervisorComprehensiveExamDashboardRoute,
} from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  authHeaders,
} from "./comprehensiveExamShared";
import SupervisorProposeExamModal from "./SupervisorProposeExamModal";
import SupervisorComprehensiveExamModal from "./SupervisorComprehensiveExamModal";

export default function SupervisorComprehensiveExamDashboard() {
  const [theses, setTheses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proposingThesis, setProposingThesis] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [thesisRes, examRes] = await Promise.all([
        axios.get(supervisorDashboardRoute, { headers: authHeaders() }),
        axios.get(supervisorComprehensiveExamDashboardRoute, {
          headers: authHeaders(),
        }),
      ]);
      setTheses([
        ...(thesisRes.data.pending || []),
        ...(thesisRes.data.forwarded || []),
      ]);
      setExams(examRes.data.exams || []);
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
    setSelectedId(null);
    fetchData();
  }, [fetchData]);

  const rows = useMemo(() => {
    const examByRoll = new Map(exams.map((e) => [e.student_roll, e]));
    return theses.map((t) => ({
      thesis: t,
      exam: examByRoll.get(t.student_roll) || null,
    }));
  }, [theses, exams]);

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
        Comprehensive Examinations
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
          {rows.map(({ thesis, exam }) => (
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
                  <Button size="xs" onClick={() => setSelectedId(exam.id)}>
                    Manage
                  </Button>
                ) : (
                  <Button size="xs" onClick={() => setProposingThesis(thesis)}>
                    Propose Exam
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {proposingThesis && (
        <SupervisorProposeExamModal
          thesis={proposingThesis}
          onClose={() => setProposingThesis(null)}
          refresh={handleRefresh}
        />
      )}
      {selectedId && (
        <SupervisorComprehensiveExamModal
          examId={selectedId}
          onClose={() => setSelectedId(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
