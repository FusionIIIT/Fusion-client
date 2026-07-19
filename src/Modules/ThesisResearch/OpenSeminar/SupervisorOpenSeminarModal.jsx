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
  MultiSelect,
  Checkbox,
  TextInput,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  facultyListRoute,
  openSeminarEligibilityPreviewRoute,
  supervisorOpenSeminarDetailRoute,
  supervisorResubmitOpenSeminarRoute,
  supervisorRetryOpenSeminarRoute,
} from "../../../routes/academicRoutes";
import {
  SEMINAR_STATUS_LABEL,
  SEMINAR_STATUS_COLOR,
  ATTEMPT_STATUS_LABEL,
  ATTEMPT_STATUS_COLOR,
  authHeaders,
  currentAttempt,
} from "./openSeminarShared";

const EMPTY_FORM = {
  proposed_date: "",
  teaching_credits: 0,
  first_draft_sent_to_dean: false,
  committee: [],
};

export default function SupervisorOpenSeminarModal({
  seminarId,
  onClose,
  refresh,
}) {
  const [seminar, setSeminar] = useState(null);
  const [facOpts, setFacOpts] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        axios.get(supervisorOpenSeminarDetailRoute(seminarId), {
          headers: authHeaders(),
        }),
        axios.get(facultyListRoute, { headers: authHeaders() }),
      ]);
      setSeminar(sRes.data);
      setFacOpts(
        fRes.data.map((f) => ({ value: String(f.id), label: f.name })),
      );

      const attempt = currentAttempt(sRes.data);
      setForm({
        proposed_date: attempt?.proposed_date || "",
        teaching_credits: attempt?.teaching_credits || 0,
        first_draft_sent_to_dean: attempt?.first_draft_sent_to_dean || false,
        committee: attempt?.committee.map((m) => String(m.id)) || [],
      });

      const eRes = await axios.get(
        openSeminarEligibilityPreviewRoute(sRes.data.student_roll),
        { headers: authHeaders() },
      );
      setEligibility(eRes.data);
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
  const canResubmit = attempt?.status === "convener_rejected";
  const canRetry = attempt?.status === "not_satisfactory";
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleResubmit = async () => {
    setBusy(true);
    try {
      await axios.post(supervisorResubmitOpenSeminarRoute(seminar.id), form, {
        headers: authHeaders(),
      });
      showNotification({
        title: "Resubmitted",
        message: "Sent for Convener approval again.",
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

  const handleRetry = async () => {
    if (form.committee.length === 0) {
      showNotification({
        title: "Missing fields",
        message: "Select at least one committee member.",
        color: "yellow",
      });
      return;
    }
    setBusy(true);
    try {
      await axios.post(supervisorRetryOpenSeminarRoute(seminar.id), form, {
        headers: authHeaders(),
      });
      showNotification({
        title: "New Attempt Started",
        message: "Fresh committee sent for Convener approval.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Retry failed",
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Manage Open Seminar" size="80%">
      <Stack spacing="md">
        <Group justify="space-between">
          <Text fw={500}>
            {seminar.student_name} ({seminar.student_roll})
          </Text>
          <Badge color={SEMINAR_STATUS_COLOR[seminar.status]}>
            {SEMINAR_STATUS_LABEL[seminar.status] || seminar.status}
          </Badge>
        </Group>

        {attempt && (
          <Badge color={ATTEMPT_STATUS_COLOR[attempt.status]} w="fit-content">
            Attempt {attempt.attempt_number}:{" "}
            {ATTEMPT_STATUS_LABEL[attempt.status] || attempt.status}
          </Badge>
        )}

        {canResubmit && (
          <Alert color="red" title="Rejected by Convener">
            {attempt.convener_remarks || "Edit the committee and resubmit."}
          </Alert>
        )}
        {canRetry && (
          <Alert color="red" title="Not Satisfactory">
            {attempt.committee_comments ||
              "Start a new attempt with a fresh committee."}
          </Alert>
        )}

        {(canResubmit || canRetry) && (
          <>
            <Divider label="Credit Breakdown (auto-computed)" />
            <Table striped highlightOnHover>
              <tbody>
                <tr>
                  <td>
                    <Text fw={500}>Course Work</Text>
                  </td>
                  <td>{eligibility?.course_work_credits ?? "—"}</td>
                </tr>
                <tr>
                  <td>
                    <Text fw={500}>Progress Seminar</Text>
                  </td>
                  <td>{eligibility?.progress_seminar_credits ?? "—"}</td>
                </tr>
                <tr>
                  <td>
                    <Text fw={500}>Thesis Research</Text>
                  </td>
                  <td>{eligibility?.thesis_research_credits ?? "—"}</td>
                </tr>
                <tr>
                  <td>
                    <Text fw={500}>Semesters Completed</Text>
                  </td>
                  <td>{eligibility?.semesters_completed ?? "—"}</td>
                </tr>
                <tr>
                  <td>
                    <Text fw={500}>RPC Recommended Open Seminar?</Text>
                  </td>
                  <td>
                    {eligibility?.rpc_recommended_open_seminar ? "Yes" : "No"}
                  </td>
                </tr>
              </tbody>
            </Table>

            <TextInput
              label="Proposed Date of Open Seminar"
              type="date"
              value={form.proposed_date}
              onChange={(e) => set("proposed_date")(e.target.value)}
            />
            <TextInput
              label="Credit earned through Teaching"
              description="Not tracked elsewhere in Fusion yet — enter manually"
              type="number"
              min={0}
              value={form.teaching_credits}
              onChange={(e) =>
                set("teaching_credits")(Number(e.target.value) || 0)
              }
            />
            <Checkbox
              label="1st draft of thesis sent to Dean's office"
              checked={form.first_draft_sent_to_dean}
              onChange={(e) =>
                set("first_draft_sent_to_dean")(e.target.checked)
              }
            />
            <MultiSelect
              label="Open Seminar Committee (up to 5 members)"
              data={facOpts}
              value={form.committee}
              onChange={set("committee")}
              searchable
              maxValues={5}
            />
            <Button
              onClick={canResubmit ? handleResubmit : handleRetry}
              loading={busy}
            >
              {canResubmit ? "Resubmit" : "Start New Attempt"}
            </Button>
          </>
        )}

        {!canResubmit && !canRetry && attempt && (
          <>
            <Divider label="Committee" />
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Discipline</th>
                </tr>
              </thead>
              <tbody>
                {attempt.committee.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.discipline}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {attempt.dean_nominee && (
              <Text size="sm">Dean Nominee: {attempt.dean_nominee.name}</Text>
            )}
            {attempt.result && (
              <>
                <Text fw={500}>
                  Result:{" "}
                  {attempt.result === "satisfactory"
                    ? "Satisfactory"
                    : "Not Satisfactory"}
                </Text>
                {attempt.committee_comments && (
                  <Text size="sm">{attempt.committee_comments}</Text>
                )}
              </>
            )}
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
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
