import React, { useState, useEffect, useCallback } from "react";
import { Card, Title, Badge, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import FusionTable from "../../../components/FusionTable";
import { academicOfficeTeachingCreditListRoute } from "../../../routes/academicRoutes";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  RESULT_LABEL,
  authHeaders,
} from "./teachingCreditShared";

const COLUMNS = [
  "Roll No",
  "Student",
  "Discipline",
  "Semester",
  "Course",
  "Status",
  "Result",
];

export default function AcademicOfficeTeachingCreditList() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(academicOfficeTeachingCreditListRoute, {
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

  const rows = registrations.map((r) => ({
    id: r.id,
    "Roll No": r.student_roll,
    Student: r.student_name,
    Discipline: r.student_discipline,
    Semester: r.semester_no,
    Course: r.allocated_course
      ? `${r.allocated_course.code} — ${r.allocated_course.name}`
      : "—",
    Status: (
      <Badge color={STATUS_COLOR[r.status]}>
        {STATUS_LABEL[r.status] || r.status}
      </Badge>
    ),
    Result: r.result ? RESULT_LABEL[r.result] : "—",
  }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Teaching Credit — All Registrations
      </Title>

      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="Teaching credit registrations"
        emptyMessage="No teaching credit registrations found."
      />
    </Card>
  );
}
