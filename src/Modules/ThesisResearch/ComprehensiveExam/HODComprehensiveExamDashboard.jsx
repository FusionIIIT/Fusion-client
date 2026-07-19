import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Table, Button, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { hodComprehensiveExamDashboardRoute } from "../../../routes/academicRoutes";
import { authHeaders } from "./comprehensiveExamShared";
import HODReviewSubjectsModal from "./HODReviewSubjectsModal";

export default function HODComprehensiveExamDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(hodComprehensiveExamDashboardRoute, {
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
        Comprehensive Exam — Subject Review
      </Title>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student</th>
            <th>Supervisor</th>
            <th>Attempt</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 && (
            <tr>
              <td colSpan={5}>No floated subjects pending review.</td>
            </tr>
          )}
          {pending.map((e) => (
            <tr key={e.id}>
              <td>{e.student_roll}</td>
              <td>{e.student_name}</td>
              <td>{e.supervisor?.name}</td>
              <td>
                {e.current_attempt_number} / {e.max_attempts}
              </td>
              <td>
                <Button size="xs" onClick={() => setSelected(e)}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selected && (
        <HODReviewSubjectsModal
          exam={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
