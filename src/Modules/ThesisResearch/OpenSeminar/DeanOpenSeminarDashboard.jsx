import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Table,
  Button,
  Center,
  Loader,
  Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { deanOpenSeminarDashboardRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
} from "./openSeminarShared";
import DeanAppointNomineeModal from "./DeanAppointNomineeModal";
import DeanFinalApproveOpenSeminarModal from "./DeanFinalApproveOpenSeminarModal";

export default function DeanOpenSeminarDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(deanOpenSeminarDashboardRoute, {
        headers: authHeaders(),
      });
      const appointment = (res.data.pending_appointment || []).map((s) => ({
        ...s,
        stage: "appointment",
      }));
      const final = (res.data.pending_final || []).map((s) => ({
        ...s,
        stage: "final",
      }));
      setPending([...appointment, ...final]);
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
    setSel(null);
    fetchData();
  };

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );

  const hasFinal = pending.some((s) => s.stage === "final");
  const colCount = hasFinal ? 7 : 5;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Open Seminar — Dean Academic
      </Title>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student</th>
            <th>Thesis Title</th>
            <th>Supervisor</th>
            {hasFinal && <th>Attempt</th>}
            {hasFinal && <th>Committee Result</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 && (
            <tr>
              <td colSpan={colCount}>No seminars pending review.</td>
            </tr>
          )}
          {pending.map((s) => (
            <tr key={`${s.stage}-${s.id}`}>
              <td>{s.student_roll}</td>
              <td>{s.student_name}</td>
              <td>{s.possible_thesis_title || "—"}</td>
              <td>{s.supervisor?.name}</td>
              {hasFinal && (
                <td>
                  {s.stage === "final"
                    ? currentAttempt(s)?.attempt_number
                    : "—"}
                </td>
              )}
              {hasFinal && (
                <td>
                  {s.stage === "final" ? (
                    <Badge
                      color={ATTEMPT_STATUS_COLOR[currentAttempt(s)?.result]}
                    >
                      {ATTEMPT_STATUS_LABEL[currentAttempt(s)?.result] ||
                        currentAttempt(s)?.result}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
              )}
              <td>
                <Button size="xs" onClick={() => setSel(s)}>
                  {s.stage === "final" ? "Review & Approve" : "Review"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {sel && sel.stage === "appointment" && (
        <DeanAppointNomineeModal
          seminar={sel}
          onClose={() => setSel(null)}
          refresh={handleRefresh}
        />
      )}
      {sel && sel.stage === "final" && (
        <DeanFinalApproveOpenSeminarModal
          seminar={sel}
          onClose={() => setSel(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
