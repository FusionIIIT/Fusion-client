import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  MultiSelect,
  Checkbox,
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
  facultyListRoute,
  openSeminarEligibilityPreviewRoute,
  supervisorProposeOpenSeminarRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./openSeminarShared";

export default function SupervisorProposeOpenSeminarModal({
  thesis,
  onClose,
  refresh,
}) {
  const [facOpts, setFacOpts] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    proposed_date: "",
    teaching_credits: 0,
    first_draft_sent_to_dean: false,
    committee: [],
  });

  useEffect(() => {
    const load = async () => {
      setLoadingInfo(true);
      try {
        const [facRes, eligRes] = await Promise.all([
          axios.get(facultyListRoute, { headers: authHeaders() }),
          axios.get(openSeminarEligibilityPreviewRoute(thesis.student_roll), {
            headers: authHeaders(),
          }),
        ]);
        setFacOpts(
          facRes.data.map((f) => ({ value: String(f.id), label: f.name })),
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

  const handleSubmit = useCallback(async () => {
    if (form.committee.length === 0) {
      showNotification({
        title: "Missing fields",
        message: "Select at least one committee member.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        supervisorProposeOpenSeminarRoute,
        {
          ...form,
          roll_no: thesis.student_roll,
          possible_thesis_title: thesis.research_theme || "",
        },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Proposed",
        message: "Open Seminar committee sent for Convener approval.",
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
  }, [form, thesis, refresh]);

  return (
    <Modal
      opened
      onClose={onClose}
      title="Propose Open Seminar Committee"
      size="70%"
    >
      {loadingInfo ? (
        <Center style={{ height: 150 }}>
          <Loader />
        </Center>
      ) : (
        <Stack spacing="md">
          <Table striped highlightOnHover>
            <tbody>
              <tr>
                <td>
                  <Text fw={500}>Student</Text>
                </td>
                <td>
                  {thesis.student_name} ({thesis.student_roll})
                </td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Thesis Title</Text>
                </td>
                <td>{thesis.research_theme || "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit through Course Work</Text>
                </td>
                <td>{eligibility?.course_work_credits ?? "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit through Progress Seminar</Text>
                </td>
                <td>{eligibility?.progress_seminar_credits ?? "—"}</td>
              </tr>
              <tr>
                <td>
                  <Text fw={500}>Credit earned through Thesis Research</Text>
                </td>
                <td>{eligibility?.thesis_research_credits ?? "—"}</td>
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

          <TextInput
            label="Proposed Date of Open Seminar"
            type="date"
            value={form.proposed_date}
            onChange={(e) => set("proposed_date")(e.target.value)}
            required
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
            onChange={(e) => set("first_draft_sent_to_dean")(e.target.checked)}
          />
          <MultiSelect
            label="Open Seminar Committee (up to 5 members)"
            data={facOpts}
            value={form.committee}
            onChange={set("committee")}
            searchable
            maxValues={5}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
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
    research_theme: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
