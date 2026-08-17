import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Badge, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { supervisorTeachingCreditListRoute } from "../../../routes/academicRoutes";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  RESULT_LABEL,
  authHeaders,
} from "./teachingCreditShared";

export default function SupervisorTeachingCreditList() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(supervisorTeachingCreditListRoute, {
        headers: authHeaders(),
      });
      setRegistrations(res.data.registrations || []);
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || "Failed to load teaching credit records.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student</th>
            <th>Semester</th>
            <th>Course</th>
            <th>Status</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 && (
            <tr>
              <td colSpan={6}>
                No teaching credit registrations for your students.
              </td>
            </tr>
          )}
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>{r.student_roll}</td>
              <td>{r.student_name}</td>
              <td>{r.semester_no}</td>
              <td>
                {r.allocated_course
                  ? `${r.allocated_course.code} — ${r.allocated_course.name}`
                  : "—"}
              </td>
              <td>
                <Badge color={STATUS_COLOR[r.status]}>
                  {STATUS_LABEL[r.status] || r.status}
                </Badge>
              </td>
              <td>{r.result ? RESULT_LABEL[r.result] : "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
