import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Select,
  Button,
  Stack,
  Group,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { hodCompleteTeachingCreditRoute } from "../../../routes/academicRoutes";
import { authHeaders, REGISTRATION_SHAPE } from "./teachingCreditShared";

export default function HODCompleteTeachingCreditModal({
  registration,
  onClose,
  refresh,
}) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const evaluations = registration.evaluations || [];

  const handleSubmit = async () => {
    if (!result) {
      showNotification({
        title: "Missing field",
        message: "Select Satisfactory or Not Satisfactory.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        hodCompleteTeachingCreditRoute(registration.id),
        { result },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Completed",
        message:
          result === "satisfactory"
            ? "Teaching credit awarded."
            : "Marked Not Satisfactory.",
        color: result === "satisfactory" ? "green" : "yellow",
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
    <Modal
      opened
      onClose={onClose}
      title="Teaching Credit — Mark Completion"
      size="70%"
    >
      <Stack spacing="md">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student</Text>
              </td>
              <td>
                {registration.student_name} ({registration.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Course</Text>
              </td>
              <td>
                {registration.allocated_course?.code} —{" "}
                {registration.allocated_course?.name}
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Evaluations Received</Text>
              </td>
              <td>{registration.evaluation_count}</td>
            </tr>
          </tbody>
        </Table>

        <Divider label="Student Evaluations (anonymous)" />
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Punctuality</th>
              <th>Schedule</th>
              <th>Sequence</th>
              <th>Aids</th>
              <th>Q&amp;A</th>
              <th>Overall</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 && (
              <tr>
                <td colSpan={7}>No evaluations submitted yet.</td>
              </tr>
            )}
            {evaluations.map((e, idx) => (
              <tr key={idx}>
                <td>{e.punctuality_band || "—"}</td>
                <td>{e.schedule_adherence_band || "—"}</td>
                <td>{e.topics_sequence || "—"}</td>
                <td>{e.teaching_aids || "—"}</td>
                <td>{e.questions_answered || "—"}</td>
                <td>{e.overall_effectiveness || "—"}</td>
                <td>{e.strengths_weaknesses || "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Select
          label="Mark Teaching Credit As"
          data={[
            { value: "satisfactory", label: "Satisfactory (awards credit)" },
            {
              value: "not_satisfactory",
              label: "Not Satisfactory (terminal, no credit)",
            },
          ]}
          value={result}
          onChange={setResult}
          required
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODCompleteTeachingCreditModal.propTypes = {
  registration: REGISTRATION_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
