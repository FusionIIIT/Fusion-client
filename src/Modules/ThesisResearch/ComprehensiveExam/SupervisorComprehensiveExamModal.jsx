import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  Badge,
  Table,
  Button,
  Center,
  Loader,
  Stack,
  Group,
  TextInput,
  Select,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  supervisorStudentAcademicInfoRoute,
  supervisorComprehensiveExamDetailRoute,
  supervisorResubmitComprehensiveExamRoute,
} from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  currentAttempt,
  isAttemptReadyToForward,
} from "./comprehensiveExamShared";
import RPCReviewPanel from "./RPCReviewPanel";

export default function SupervisorComprehensiveExamModal({
  examId,
  viewerIsSupervisor,
  onClose,
  refresh,
}) {
  const [exam, setExam] = useState(null);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [resubmitForm, setResubmitForm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const eRes = await axios.get(
        supervisorComprehensiveExamDetailRoute(examId),
        {
          headers: authHeaders(),
        },
      );
      setExam(eRes.data);
      setResubmitForm({
        possible_thesis_title: eRes.data.possible_thesis_title,
        proposed_exam_date: eRes.data.proposed_exam_date || "",
        entry_qualification: eRes.data.entry_qualification,
      });
      const infoRes = await axios.get(
        supervisorStudentAcademicInfoRoute(eRes.data.student_roll),
        { headers: authHeaders() },
      );
      setAcademicInfo(infoRes.data);
    } catch {
      showNotification({
        title: "Error",
        message: "Failed to load exam details.",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  if (!exam) return null;

  const attempt = currentAttempt(exam);
  const topBadge =
    attempt && isAttemptReadyToForward(attempt)
      ? { color: "blue", label: "In Progress" }
      : attempt && exam.status === "in_progress"
        ? {
            color: ATTEMPT_STATUS_COLOR[attempt.status],
            label: ATTEMPT_STATUS_LABEL[attempt.status] || attempt.status,
          }
        : {
            color: EXAM_STATUS_COLOR[exam.status],
            label: EXAM_STATUS_LABEL[exam.status] || exam.status,
          };

  const handleResubmit = async () => {
    setBusy(true);
    try {
      await axios.post(
        supervisorResubmitComprehensiveExamRoute(exam.id),
        resubmitForm,
        { headers: authHeaders() },
      );
      showNotification({
        title: "Resubmitted",
        message: "Sent for Academic Office verification again.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Resubmit failed",
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title="Manage Comprehensive Examination"
      size="80%"
    >
      <Stack gap="md">
        <Group justify="flex-end">
          <Badge color={topBadge.color}>{topBadge.label}</Badge>
        </Group>

        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student Name</Text>
              </td>
              <td>{exam.student_name}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Roll No</Text>
              </td>
              <td>{exam.student_roll}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Discipline</Text>
              </td>
              <td>{exam.student_discipline || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Semester</Text>
              </td>
              <td>{exam.semester_no ?? "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Thesis Title</Text>
              </td>
              <td>{exam.possible_thesis_title || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Supervisor</Text>
              </td>
              <td>{exam.supervisor?.name || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Co-Supervisor</Text>
              </td>
              <td>{exam.co_supervisor ? exam.co_supervisor.name : "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Proposed Date of Examination</Text>
              </td>
              <td>{exam.proposed_exam_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Credits Completed Through Course Work</Text>
              </td>
              <td>
                {academicInfo?.credits_completed ?? "—"} /{" "}
                {exam.required_credits} required
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Current CPI</Text>
              </td>
              <td>{academicInfo?.current_cpi ?? "—"} (min 7.0 required)</td>
            </tr>
          </tbody>
        </Table>

        {!attempt && (
          <>
            <Text fw={500}>Examination Committee (RPC)</Text>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Discipline</th>
                </tr>
              </thead>
              <tbody>
                {exam.committee.length === 0 && (
                  <tr>
                    <td colSpan={2}>
                      <Text c="dimmed">Not yet constituted</Text>
                    </td>
                  </tr>
                )}
                {exam.committee.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.discipline}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {viewerIsSupervisor &&
          (exam.status === "academic_office_rejected" ||
            exam.status === "dpgc_rejected") &&
          resubmitForm && (
            <>
              <Alert color="red" title="Rejected — edit and resubmit">
                {exam.academic_office_remarks || exam.dpgc_remarks}
              </Alert>
              <TextInput
                label="Thesis Title"
                value={resubmitForm.possible_thesis_title}
                onChange={(e) =>
                  setResubmitForm((f) => ({
                    ...f,
                    possible_thesis_title: e.target.value,
                  }))
                }
              />
              <TextInput
                label="Proposed Date of Examination"
                type="date"
                value={resubmitForm.proposed_exam_date}
                onChange={(e) =>
                  setResubmitForm((f) => ({
                    ...f,
                    proposed_exam_date: e.target.value,
                  }))
                }
              />
              <Select
                label="Entry Qualification"
                data={[
                  {
                    value: "masters",
                    label: "ME/M.Tech/M.Des/M.Phil (16 credits required)",
                  },
                  {
                    value: "bachelors",
                    label: "B.Tech/B.E./M.Sc./MA (40 credits required)",
                  },
                ]}
                value={resubmitForm.entry_qualification}
                onChange={(v) =>
                  setResubmitForm((f) => ({ ...f, entry_qualification: v }))
                }
              />
              <Button onClick={handleResubmit} loading={busy}>
                Resubmit
              </Button>
            </>
          )}

        {exam.status === "dpgc_pending" && (
          <Text c="dimmed">Awaiting Convener (DPGC) approval.</Text>
        )}

        {exam.status === "academic_office_pending" && (
          <Text c="dimmed">
            Awaiting Academic Office eligibility verification.
          </Text>
        )}

        {attempt && (
          <>
            <Divider label={`Attempt ${attempt.attempt_number}`} />

            {attempt.pgcs_remarks && attempt.status === "rpc_pending" && (
              <Alert color="red" title="Sent back by Convener (PGCS)">
                {attempt.pgcs_remarks}
              </Alert>
            )}

            {attempt.result && (
              <Text fw={500}>
                Candidate&apos;s Performance in Examination:{" "}
                {attempt.result === "passed" ? "Passed" : "Failed"}
              </Text>
            )}

            <RPCReviewPanel attemptId={attempt.id} onUpdate={refresh} />
          </>
        )}

        {exam.attempts.length > 1 && (
          <>
            <Divider label="Previous Attempts" />
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Attempt</th>
                  <th>Status</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {exam.attempts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.attempt_number}</td>
                    <td>{ATTEMPT_STATUS_LABEL[a.status] || a.status}</td>
                    <td>{a.result || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Stack>
    </Modal>
  );
}

SupervisorComprehensiveExamModal.propTypes = {
  examId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  viewerIsSupervisor: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

SupervisorComprehensiveExamModal.defaultProps = {
  viewerIsSupervisor: true,
};
