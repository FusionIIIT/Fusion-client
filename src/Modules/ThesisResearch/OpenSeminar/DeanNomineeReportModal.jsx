import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Select,
  Textarea,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { deanNomineeSubmitOpenSeminarReportRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  RATING_3WAY_OPTIONS,
  QUALITY_OPTIONS,
  OPEN_SEMINAR_SHAPE,
} from "./openSeminarShared";

export default function DeanNomineeReportModal({ seminar, onClose, refresh }) {
  // Must target the specific attempt this nominee was appointed to and still
  // owes a report for -- NOT the seminar's current attempt, which may have
  // moved on to a retry since this nominee was appointed.
  const attemptId = seminar.nominee_attempt_id;
  const [form, setForm] = useState({
    quality: "",
    quantity: "",
    publications: "",
    overall: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.overall) {
      showNotification({
        title: "Overall performance required",
        message: "Select Satisfactory or Not Satisfactory.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        deanNomineeSubmitOpenSeminarReportRoute(attemptId),
        form,
        { headers: authHeaders() },
      );
      showNotification({
        title: "Submitted",
        message: "Your report has been recorded.",
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
  };

  return (
    <Modal opened onClose={onClose} title="Report of Dean Nominee" size="70%">
      <Stack gap="md">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student</Text>
              </td>
              <td>
                {seminar.student_name} ({seminar.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Thesis Title</Text>
              </td>
              <td>{seminar.possible_thesis_title || "—"}</td>
            </tr>
          </tbody>
        </Table>

        <Select
          label="Quality of Work Done"
          data={QUALITY_OPTIONS}
          value={form.quality}
          onChange={set("quality")}
        />
        <Select
          label="Quantity of Work Done"
          data={RATING_3WAY_OPTIONS}
          value={form.quantity}
          onChange={set("quantity")}
        />
        <Select
          label="Publications"
          data={RATING_3WAY_OPTIONS}
          value={form.publications}
          onChange={set("publications")}
        />
        <Select
          label="Candidate's Overall Performance in the Open Seminar"
          data={[
            { value: "satisfactory", label: "Satisfactory" },
            { value: "not_satisfactory", label: "Not Satisfactory" },
          ]}
          value={form.overall}
          onChange={set("overall")}
          required
        />
        <Textarea
          label="Comments / Suggestions"
          value={form.comments}
          onChange={(e) => set("comments")(e.target.value)}
          minRows={3}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit Report
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

DeanNomineeReportModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
