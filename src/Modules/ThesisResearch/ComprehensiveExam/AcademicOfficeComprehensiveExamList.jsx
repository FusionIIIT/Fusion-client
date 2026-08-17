import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Select,
  Table,
  Button,
  Badge,
  Center,
  Loader,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { academicOfficeComprehensiveExamListRoute } from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  authHeaders,
} from "./comprehensiveExamShared";
import AcademicOfficeVerifyModal from "./AcademicOfficeVerifyModal";

export default function AcademicOfficeComprehensiveExamList() {
  const [exams, setExams] = useState([]);
  const [statusFilter, setStatusFilter] = useState("academic_office_pending");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(academicOfficeComprehensiveExamListRoute, {
        headers: authHeaders(),
        params: statusFilter ? { status: statusFilter } : {},
      });
      setExams(res.data.exams || []);
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
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setSelected(null);
    fetchData();
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Select
        label="Status"
        data={Object.entries(EXAM_STATUS_LABEL).map(([value, label]) => ({
          value,
          label,
        }))}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v || "")}
        clearable
        mb="md"
        style={{ maxWidth: 320 }}
      />

      {loading ? (
        <Center style={{ height: 150 }}>
          <Loader />
        </Center>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 && (
              <tr>
                <td colSpan={5}>No records found.</td>
              </tr>
            )}
            {exams.map((e) => (
              <tr key={e.id}>
                <td>{e.student_roll}</td>
                <td>{e.student_name}</td>
                <td>{e.supervisor?.name}</td>
                <td>
                  <Badge color={EXAM_STATUS_COLOR[e.status]}>
                    {EXAM_STATUS_LABEL[e.status] || e.status}
                  </Badge>
                </td>
                <td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      onClick={() => setSelected(e)}
                      disabled={e.status !== "academic_office_pending"}
                    >
                      Verify
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {selected && (
        <AcademicOfficeVerifyModal
          exam={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
