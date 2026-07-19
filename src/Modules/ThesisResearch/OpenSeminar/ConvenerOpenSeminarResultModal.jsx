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
import { convenerSubmitOpenSeminarReportRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  OPEN_SEMINAR_SHAPE,
} from "./openSeminarShared";

export default function ConvenerOpenSeminarResultModal({
  seminar,
  onClose,
  refresh,
}) {
  const attempt = currentAttempt(seminar);
  const [result, setResult] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!result) {
      showNotification({
        title: "Result required",
        message: "Select Satisfactory or Not Satisfactory.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        convenerSubmitOpenSeminarReportRoute(attempt.id),
        { result, comments },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Result Recorded",
        message:
          result === "satisfactory"
            ? "Student's Open Seminar is Satisfactory."
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
    <Modal opened onClose={onClose} title="Open Seminar Report" size="70%">
      <Stack spacing="md">
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
                <Text fw={500}>Attempt</Text>
              </td>
              <td>{attempt?.attempt_number}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Dean Nominee</Text>
              </td>
              <td>{attempt?.dean_nominee?.name || "—"}</td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Committee</Text>
        <Table striped highlightOnHover>
          <tbody>
            {attempt?.committee.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Select
          label="Candidate's Performance in the Open Seminar"
          data={[
            { value: "satisfactory", label: "Satisfactory" },
            { value: "not_satisfactory", label: "Not Satisfactory" },
          ]}
          value={result}
          onChange={setResult}
          required
        />
        <Textarea
          label="Brief Comments on Performance of the Student"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
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

ConvenerOpenSeminarResultModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
