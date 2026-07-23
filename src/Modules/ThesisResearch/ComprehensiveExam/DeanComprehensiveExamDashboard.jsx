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
import { deanComprehensiveExamDashboardRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
} from "./comprehensiveExamShared";
import DeanApproveModal from "./DeanApproveModal";

export default function DeanComprehensiveExamDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(deanComprehensiveExamDashboardRoute, {
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
        Comprehensive Exam — Final Approval
      </Title>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student</th>
            <th>Attempt</th>
            <th>Result</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 && (
            <tr>
              <td colSpan={5}>No attempts pending final approval.</td>
            </tr>
          )}
          {pending.map((e) => (
            <tr key={e.id}>
              <td>{e.student_roll}</td>
              <td>{e.student_name}</td>
              <td>{currentAttempt(e)?.attempt_number}</td>
              <td>
                <Badge color={ATTEMPT_STATUS_COLOR[currentAttempt(e)?.result]}>
                  {ATTEMPT_STATUS_LABEL[currentAttempt(e)?.result] ||
                    currentAttempt(e)?.result}
                </Badge>
              </td>
              <td>
                <Button size="xs" onClick={() => setSelected(e)}>
                  Review &amp; Approve
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selected && (
        <DeanApproveModal
          exam={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
