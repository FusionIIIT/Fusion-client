import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Table, Button, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { deanNomineeOpenSeminarDashboardRoute } from "../../../routes/academicRoutes";
import { authHeaders } from "./openSeminarShared";
import DeanNomineeReportModal from "./DeanNomineeReportModal";

export default function DeanNomineeDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(deanNomineeOpenSeminarDashboardRoute, {
        headers: authHeaders(),
      });
      setPending(res.data.pending || []);
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
    setSelected(null);
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
        Open Seminar — Dean Nominee Reports
      </Title>

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
          {pending.length === 0 && (
            <tr>
              <td colSpan={5}>No pending Dean Nominee reports.</td>
            </tr>
          )}
          {pending.map((s) => (
            <tr key={s.id}>
              <td>{s.student_roll}</td>
              <td>{s.student_name}</td>
              <td>{s.possible_thesis_title || "—"}</td>
              <td>{s.supervisor?.name}</td>
              <td>
                <Button size="xs" onClick={() => setSelected(s)}>
                  Submit Report
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selected && (
        <DeanNomineeReportModal
          seminar={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
