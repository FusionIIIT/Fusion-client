import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Badge,
  Table,
  Button,
  Center,
  Loader,
  Group,
  Divider,
  Alert,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { studentTeachingCreditRoute } from "../../../routes/academicRoutes";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  RESULT_LABEL,
  authHeaders,
} from "./teachingCreditShared";
import StudentProposeTeachingCreditModal from "./StudentProposeTeachingCreditModal";
import StudentResubmitTeachingCreditModal from "./StudentResubmitTeachingCreditModal";
import TeachingCreditEvaluationSection from "./TeachingCreditEvaluationSection";

export default function StudentTeachingCreditPage() {
  const [registrations, setRegistrations] = useState([]);
  const [comprehensiveExamPassed, setComprehensiveExamPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState(false);
  const [resubmitReg, setResubmitReg] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(studentTeachingCreditRoute, {
        headers: authHeaders(),
      });
      setRegistrations(res.data.registrations || []);
      setComprehensiveExamPassed(!!res.data.comprehensive_exam_passed);
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || "Failed to load teaching credit data.",
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
    setProposing(false);
    setResubmitReg(null);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Teaching Credit</Title>
        <Button
          onClick={() => setProposing(true)}
          disabled={!comprehensiveExamPassed}
        >
          Pre-Register for Teaching Credit
        </Button>
      </Group>

      {!comprehensiveExamPassed && (
        <Alert color="yellow" mb="md">
          You must pass the Comprehensive Examination before registering for
          teaching credit.
        </Alert>
      )}

      <Table striped highlightOnHover mb="md">
        <thead>
          <tr>
            <th>Semester</th>
            <th>Choices</th>
            <th>Status</th>
            <th>Result</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length === 0 && (
            <tr>
              <td colSpan={5}>No teaching credit registrations yet.</td>
            </tr>
          )}
          {registrations.map((r) => (
            <tr key={r.id}>
              <td>Sem {r.semester_no}</td>
              <td>
                {r.status === "allocated" || r.status === "completed"
                  ? `${r.allocated_course?.code} — ${r.allocated_course?.name}`
                  : r.choices
                      .filter(Boolean)
                      .map((c) => c.code)
                      .join(", ")}
              </td>
              <td>
                <Badge color={STATUS_COLOR[r.status]}>
                  {STATUS_LABEL[r.status] || r.status}
                </Badge>
              </td>
              <td>{r.result ? RESULT_LABEL[r.result] : "—"}</td>
              <td>
                {r.status === "sent_back" && (
                  <Button size="xs" onClick={() => setResubmitReg(r)}>
                    Edit &amp; Resubmit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Divider mb="md" />
      <TeachingCreditEvaluationSection />

      {proposing && (
        <StudentProposeTeachingCreditModal
          onClose={() => setProposing(false)}
          refresh={handleRefresh}
        />
      )}
      {resubmitReg && (
        <StudentResubmitTeachingCreditModal
          registration={resubmitReg}
          onClose={() => setResubmitReg(null)}
          refresh={handleRefresh}
        />
      )}
    </Card>
  );
}
