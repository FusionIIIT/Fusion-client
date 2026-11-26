import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Modal,
  FileInput,
  TextInput,
  Button,
  Text,
  Table,
  Stack,
  Group,
  Center,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  openSeminarEligibilityPreviewRoute,
  supervisorProposeOpenSeminarRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./openSeminarShared";

export default function SupervisorProposeOpenSeminarModal({
  thesis,
  onClose,
  refresh,
}) {
  const [eligibility, setEligibility] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    proposed_date: "",
  });
  const [firstDraftFile, setFirstDraftFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingInfo(true);
      try {
        const eligRes = await axios.get(
          openSeminarEligibilityPreviewRoute(thesis.student_roll),
          { headers: authHeaders() },
        );
        setEligibility(eligRes.data);
      } catch {
        showNotification({
          title: "Error",
          message: "Failed to load student eligibility info.",
          color: "red",
        });
      } finally {
        setLoadingInfo(false);
      }
    };
    load();
  }, [thesis.student_roll]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const requirementSuffix = (key) =>
    eligibility?.required_credits
      ? ` (min ${eligibility.required_credits[key]} required)`
      : "";

  const handleSubmit = useCallback(async () => {
    if (!firstDraftFile) {
      showNotification({
        title: "Missing fields",
        message: "The 1st draft of the thesis is required.",
        color: "yellow",
      });
      return;
    }
    if (!form.proposed_date) {
      showNotification({
        title: "Missing fields",
        message: "Proposed date is required.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("proposed_date", form.proposed_date);
      fd.append("roll_no", thesis.student_roll);
      fd.append("possible_thesis_title", thesis.research_theme || "");
      if (thesis.co_supervisor?.id) {
        fd.append("co_supervisor_id", thesis.co_supervisor.id);
      }
      if (firstDraftFile) {
        fd.append("first_draft_document", firstDraftFile);
      }
      await axios.post(supervisorProposeOpenSeminarRoute, fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Proposed",
        message: "Open Seminar sent for Convener (DPGC) review.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [form, firstDraftFile, thesis, refresh]);

  return (
    <Modal opened onClose={onClose} title="Propose Open Seminar" size="70%">
      {loadingInfo ? (
        <Center style={{ height: 150 }}>
          <Loader />
        </Center>
      ) : (
        <Stack gap="md">
          <Table striped highlightOnHover>
            <tbody>
              <tr>
                <td>
                  <Text fw={500}>Student Name</Text>
                </td>
                <td>{thesis.student_name}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Roll No</Text>
                </td>
                <td>{thesis.student_roll}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Discipline</Text>
                </td>
                <td>{thesis.student_discipline || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Thesis Title</Text>
                </td>
                <td>{thesis.research_theme || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Supervisor</Text>
                </td>
                <td>{thesis.supervisor ? thesis.supervisor.name : "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Co-Supervisor</Text>
                </td>
                <td>
                  {thesis.co_supervisor ? thesis.co_supervisor.name : "—"}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit through Course Work</Text>
                </td>
                <td>
                  {eligibility?.course_work_credits ?? "—"}
                  {requirementSuffix("course_work")}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit through Progress Seminar</Text>
                </td>
                <td>
                  {eligibility?.progress_seminar_credits ?? "—"}
                  {requirementSuffix("progress_seminar")}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit earned through Thesis Research</Text>
                </td>
                <td>
                  {eligibility?.thesis_research_credits ?? "—"}
                  {requirementSuffix("thesis_research")}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit earned through Teaching</Text>
                </td>
                <td>
                  {eligibility?.teaching_credits ?? "—"}
                  {requirementSuffix("teaching")}
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Current CPI</Text>
                </td>
                <td>
                  {eligibility?.current_cpi ?? "—"} (min {eligibility?.min_cpi}{" "}
                  required)
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>No. of Semesters Completed</Text>
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

          {(eligibility?.errors || []).length > 0 && (
            <Alert color="red" title="Not eligible for Open Seminar">
              {eligibility.errors.map((r) => (
                <Text key={r} size="sm">
                  {r}
                </Text>
              ))}
            </Alert>
          )}

          <Text fw={500}>Examination Committee (RPC)</Text>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Discipline</th>
              </tr>
            </thead>
            <tbody>
              {(!thesis.committee || thesis.committee.length === 0) && (
                <tr>
                  <td colSpan={2}>
                    <Text c="dimmed">Not yet constituted</Text>
                  </td>
                </tr>
              )}
              {(thesis.committee || []).map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.discipline}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <TextInput
            label="Proposed Date of Open Seminar"
            type="date"
            value={form.proposed_date}
            onChange={(e) => set("proposed_date")(e.target.value)}
            required
          />
          <FileInput
            label="1st Draft of Thesis (sent to Dean's office)"
            placeholder="Upload PDF"
            accept="application/pdf"
            value={firstDraftFile}
            onChange={setFirstDraftFile}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={(eligibility?.errors || []).length > 0}
            >
              Submit Proposal
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

SupervisorProposeOpenSeminarModal.propTypes = {
  thesis: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    student_name: PropTypes.string,
    student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    student_discipline: PropTypes.string,
    research_theme: PropTypes.string,
    supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
    co_supervisor: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
    committee: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        discipline: PropTypes.string,
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
