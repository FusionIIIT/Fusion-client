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
  Textarea,
  TextInput,
  Select,
  MultiSelect,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  facultyListRoute,
  listCoursesForDropdownRoute,
  supervisorStudentAcademicInfoRoute,
  supervisorComprehensiveExamDetailRoute,
  supervisorResubmitComprehensiveExamRoute,
  supervisorFloatSubjectsRoute,
  supervisorConfirmOptedSubjectsRoute,
} from "../../../routes/academicRoutes";
import {
  EXAM_STATUS_LABEL,
  EXAM_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  currentAttempt,
} from "./comprehensiveExamShared";

export default function SupervisorComprehensiveExamModal({
  examId,
  onClose,
  refresh,
}) {
  const [exam, setExam] = useState(null);
  const [facOpts, setFacOpts] = useState([]);
  const [courseOpts, setCourseOpts] = useState([]);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [resubmitForm, setResubmitForm] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [dates, setDates] = useState({
    written_exam_date: "",
    oral_exam_date: "",
  });
  const [confirmRemarks, setConfirmRemarks] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, fRes, cRes] = await Promise.all([
        axios.get(supervisorComprehensiveExamDetailRoute(examId), {
          headers: authHeaders(),
        }),
        axios.get(facultyListRoute, { headers: authHeaders() }),
        axios.get(listCoursesForDropdownRoute, { headers: authHeaders() }),
      ]);
      setExam(eRes.data);
      setFacOpts(
        fRes.data.map((f) => ({ value: String(f.id), label: f.name })),
      );
      setCourseOpts(
        (cRes.data.courses || []).map((c) => ({
          value: String(c.id),
          label: `${c.code} - ${c.name}`,
        })),
      );
      setResubmitForm({
        possible_thesis_title: eRes.data.possible_thesis_title,
        entry_qualification: eRes.data.entry_qualification,
        co_supervisor_id: eRes.data.co_supervisor
          ? String(eRes.data.co_supervisor.id)
          : "",
        committee: eRes.data.committee.map((m) => String(m.id)),
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
  // Once floated, subjects are locked while pending HOD review -- only
  // editable again if HOD sends them back.
  const canEditSubjects = attempt?.status === "hod_rejected";
  const needsNewAttempt = exam.status === "in_progress" && !attempt;

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

  const handleFloatSubjects = async () => {
    if (subjects.length < 2) {
      showNotification({
        title: "Not enough subjects",
        message: "Select at least 2 subjects from the course list.",
        color: "yellow",
      });
      return;
    }
    const subjectNames = subjects.map(
      (id) => courseOpts.find((c) => c.value === id)?.label || id,
    );
    setBusy(true);
    try {
      await axios.post(
        supervisorFloatSubjectsRoute(exam.id),
        { subjects: subjectNames, ...dates },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Floated",
        message: "Subjects sent to HOD for approval.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to float subjects",
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSubjects = async (confirm) => {
    setBusy(true);
    try {
      await axios.post(
        supervisorConfirmOptedSubjectsRoute(attempt.id),
        { confirm, remarks: confirmRemarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: confirm ? "Confirmed" : "Sent Back",
        message: confirm
          ? "Exam proceeds to written+oral."
          : "Student must re-select subjects.",
        color: confirm ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Action failed",
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
      <Stack spacing="md">
        <Group justify="space-between">
          <Text fw={500}>
            {exam.student_name} ({exam.student_roll})
          </Text>
          <Badge color={EXAM_STATUS_COLOR[exam.status]}>
            {EXAM_STATUS_LABEL[exam.status] || exam.status}
          </Badge>
        </Group>

        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Credits Completed Through Course Work</Text>
              </td>
              <td>{academicInfo?.credits_completed ?? "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Current CPI</Text>
              </td>
              <td>{academicInfo?.current_cpi ?? "—"}</td>
            </tr>
          </tbody>
        </Table>

        {(exam.status === "academic_office_rejected" ||
          exam.status === "convener_rejected") &&
          resubmitForm && (
            <>
              <Alert color="red" title="Rejected — edit and resubmit">
                {exam.academic_office_remarks || exam.convener_remarks}
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
              <MultiSelect
                label="Examination Committee (up to 5 members)"
                data={facOpts}
                value={resubmitForm.committee}
                onChange={(v) =>
                  setResubmitForm((f) => ({ ...f, committee: v }))
                }
                maxValues={5}
                searchable
              />
              <Button onClick={handleResubmit} loading={busy}>
                Resubmit
              </Button>
            </>
          )}

        {exam.status === "convener_pending" && (
          <Text c="dimmed">Awaiting Convener approval of the committee.</Text>
        )}

        {exam.status === "academic_office_pending" && (
          <Text c="dimmed">
            Awaiting Academic Office eligibility verification.
          </Text>
        )}

        {(needsNewAttempt || canEditSubjects) && (
          <>
            <Divider
              label={`Float Subjects — Attempt ${exam.current_attempt_number}`}
            />
            {attempt?.status === "hod_rejected" && (
              <Alert color="red" title="Rejected by HOD">
                {attempt.hod_remarks}
              </Alert>
            )}
            <MultiSelect
              label="Subjects"
              description="Select at least 2, up to 6"
              data={courseOpts}
              value={subjects}
              onChange={setSubjects}
              searchable
              maxValues={6}
            />
            <Group grow>
              <TextInput
                label="Proposed Written Exam Date"
                type="date"
                value={dates.written_exam_date}
                onChange={(e) =>
                  setDates((d) => ({ ...d, written_exam_date: e.target.value }))
                }
              />
              <TextInput
                label="Proposed Oral Exam Date"
                type="date"
                value={dates.oral_exam_date}
                onChange={(e) =>
                  setDates((d) => ({ ...d, oral_exam_date: e.target.value }))
                }
              />
            </Group>
            <Button onClick={handleFloatSubjects} loading={busy}>
              Float Subjects to HOD
            </Button>
          </>
        )}

        {attempt && !canEditSubjects && attempt.status !== "subjects_opted" && (
          <>
            <Divider label={`Attempt ${attempt.attempt_number}`} />
            <Badge color={ATTEMPT_STATUS_COLOR[attempt.status]}>
              {ATTEMPT_STATUS_LABEL[attempt.status] || attempt.status}
            </Badge>
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Opted</th>
                </tr>
              </thead>
              <tbody>
                {attempt.subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.subject_name}</td>
                    <td>{s.selected_by_student ? "Yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {(attempt.status === "passed" || attempt.status === "failed") && (
              <Text fw={500}>
                Result: {attempt.result === "passed" ? "Passed" : "Failed"}
              </Text>
            )}
          </>
        )}

        {attempt?.status === "subjects_opted" && (
          <>
            <Divider label="Student's Opted Subjects — Confirm or Send Back" />
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Opted</th>
                </tr>
              </thead>
              <tbody>
                {attempt.subjects.map((s) => (
                  <tr key={s.id}>
                    <td>{s.subject_name}</td>
                    <td>{s.selected_by_student ? "Yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Textarea
              label="Remarks (if sending back)"
              value={confirmRemarks}
              onChange={(e) => setConfirmRemarks(e.target.value)}
            />
            <Group grow>
              <Button
                onClick={() => handleConfirmSubjects(true)}
                loading={busy}
              >
                Confirm
              </Button>
              <Button
                color="red"
                onClick={() => handleConfirmSubjects(false)}
                loading={busy}
              >
                Send Back to Student
              </Button>
            </Group>
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
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
