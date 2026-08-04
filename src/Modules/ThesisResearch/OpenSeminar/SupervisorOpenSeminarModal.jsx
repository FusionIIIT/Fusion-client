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
  FileInput,
  TextInput,
  Alert,
  Divider,
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  supervisorOpenSeminarDetailRoute,
  supervisorResubmitOpenSeminarRoute,
} from "../../../routes/academicRoutes";
import {
  SEMINAR_STATUS_LABEL,
  SEMINAR_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  currentAttempt,
  isAttemptReadyToForward,
} from "./openSeminarShared";
import RPCOpenSeminarReviewPanel from "./RPCOpenSeminarReviewPanel";
import { host } from "../../../routes/globalRoutes";

export default function SupervisorOpenSeminarModal({
  seminarId,
  viewerIsSupervisor,
  onClose,
  refresh,
}) {
  const [seminar, setSeminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resubmitForm, setResubmitForm] = useState(null);
  const [firstDraftFile, setFirstDraftFile] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(supervisorOpenSeminarDetailRoute(seminarId), {
        headers: authHeaders(),
      });
      setSeminar(res.data);
      setResubmitForm({
        possible_thesis_title: res.data.possible_thesis_title,
        proposed_date: res.data.proposed_date || "",
      });
    } catch {
      showNotification({
        title: "Error",
        message: "Failed to load Open Seminar details.",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [seminarId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  if (!seminar) return null;

  const attempt = currentAttempt(seminar);
  const topBadge =
    attempt && isAttemptReadyToForward(attempt)
      ? { color: "blue", label: "In Progress" }
      : attempt && seminar.status === "in_progress"
        ? {
            color: ATTEMPT_STATUS_COLOR[attempt.status],
            label: ATTEMPT_STATUS_LABEL[attempt.status] || attempt.status,
          }
        : {
            color: SEMINAR_STATUS_COLOR[seminar.status],
            label: SEMINAR_STATUS_LABEL[seminar.status] || seminar.status,
          };

  const set = (key) => (value) =>
    setResubmitForm((f) => ({ ...f, [key]: value }));

  const handleResubmit = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("possible_thesis_title", resubmitForm.possible_thesis_title);
      fd.append("proposed_date", resubmitForm.proposed_date);
      if (firstDraftFile) {
        fd.append("first_draft_document", firstDraftFile);
      }
      await axios.post(supervisorResubmitOpenSeminarRoute(seminar.id), fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Resubmitted",
        message: "Sent for Convener (DPGC) review again.",
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
    <Modal opened onClose={onClose} title="Manage Open Seminar" size="80%">
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
              <td>{seminar.student_name}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Roll No</Text>
              </td>
              <td>{seminar.student_roll}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Discipline</Text>
              </td>
              <td>{seminar.student_discipline || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Semester</Text>
              </td>
              <td>{seminar.semester_no ?? "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Thesis Title</Text>
              </td>
              <td>{seminar.possible_thesis_title || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Supervisor</Text>
              </td>
              <td>{seminar.supervisor?.name || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Co-Supervisor</Text>
              </td>
              <td>
                {seminar.co_supervisor ? seminar.co_supervisor.name : "—"}
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Proposed Date</Text>
              </td>
              <td>{seminar.proposed_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>
                  Credits (Course Work / Progress Seminar / Thesis Research /
                  Teaching)
                </Text>
              </td>
              <td>
                {seminar.course_work_credits} /{" "}
                {seminar.progress_seminar_credits} /{" "}
                {seminar.thesis_research_credits} / {seminar.teaching_credits} ={" "}
                {seminar.total_credits} total
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>RPC Recommended Open Seminar?</Text>
              </td>
              <td>{seminar.rpc_recommended_open_seminar ? "Yes" : "No"}</td>
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
                {seminar.committee.length === 0 && (
                  <tr>
                    <td colSpan={2}>
                      <Text c="dimmed">Not yet constituted</Text>
                    </td>
                  </tr>
                )}
                {seminar.committee.map((m) => (
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
          (seminar.status === "hod_rejected" ||
            seminar.status === "dean_rejected") &&
          resubmitForm && (
            <>
              <Alert color="red" title="Rejected — edit and resubmit">
                {seminar.hod_remarks || seminar.dean_remarks}
              </Alert>
              <TextInput
                label="Thesis Title"
                value={resubmitForm.possible_thesis_title}
                onChange={(e) => set("possible_thesis_title")(e.target.value)}
              />
              <TextInput
                label="Proposed Date of Open Seminar"
                type="date"
                value={resubmitForm.proposed_date}
                onChange={(e) => set("proposed_date")(e.target.value)}
              />
              {seminar.first_draft_document_url && (
                <Text size="sm">
                  Current draft:{" "}
                  <Anchor
                    href={
                      seminar.first_draft_document_url.startsWith("http")
                        ? seminar.first_draft_document_url
                        : `${host}${seminar.first_draft_document_url.startsWith("/") ? "" : "/"}${seminar.first_draft_document_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View uploaded draft
                  </Anchor>
                </Text>
              )}
              <FileInput
                label="1st Draft of Thesis (sent to Dean's office)"
                placeholder="Upload PDF to replace"
                accept="application/pdf"
                value={firstDraftFile}
                onChange={setFirstDraftFile}
              />
              <Button onClick={handleResubmit} loading={busy}>
                Resubmit
              </Button>
            </>
          )}

        {seminar.status === "dean_pending" && (
          <Text c="dimmed">Awaiting Dean Academic approval.</Text>
        )}
        {seminar.status === "hod_pending" && (
          <Text c="dimmed">Awaiting Convener (DPGC) review.</Text>
        )}

        {attempt && (
          <>
            <Divider label={`Attempt ${attempt.attempt_number}`} />

            {attempt.hod_review_remarks && attempt.status === "rpc_pending" && (
              <Alert color="red" title="Sent back by Convener (DPGC)">
                {attempt.hod_review_remarks}
              </Alert>
            )}

            {attempt.result && (
              <Text fw={500}>
                Candidate&apos;s Performance:{" "}
                {attempt.result === "satisfactory"
                  ? "Satisfactory"
                  : "Not Satisfactory"}
              </Text>
            )}

            <RPCOpenSeminarReviewPanel
              attemptId={attempt.id}
              onUpdate={refresh}
            />
          </>
        )}

        {seminar.attempts.length > 1 && (
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
                {seminar.attempts.map((a) => (
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

SupervisorOpenSeminarModal.propTypes = {
  seminarId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  viewerIsSupervisor: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};

SupervisorOpenSeminarModal.defaultProps = {
  viewerIsSupervisor: true,
};
