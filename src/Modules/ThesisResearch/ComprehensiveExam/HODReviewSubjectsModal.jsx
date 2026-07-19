import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Textarea,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { hodReviewSubjectsRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  EXAM_SHAPE,
} from "./comprehensiveExamShared";

export default function HODReviewSubjectsModal({ exam, onClose, refresh }) {
  const attempt = currentAttempt(exam);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodReviewSubjectsRoute(attempt.id),
        { approve, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Approved" : "Rejected",
        message: approve
          ? "Student can now select subjects."
          : "Sent back to supervisor.",
        color: approve ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Action failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Review Floated Subjects" size="70%">
      <Stack spacing="md">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student</Text>
              </td>
              <td>
                {exam.student_name} ({exam.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Supervisor</Text>
              </td>
              <td>{exam.supervisor?.name}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Written Exam Date</Text>
              </td>
              <td>{attempt?.written_exam_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Oral Exam Date</Text>
              </td>
              <td>{attempt?.oral_exam_date || "—"}</td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Subjects Floated for Written Examination</Text>
        <Table striped highlightOnHover>
          <tbody>
            {attempt?.subjects.map((s) => (
              <tr key={s.id}>
                <td>{s.subject_name}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Textarea
          label="Remarks (if sending back)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Approve Subjects
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODReviewSubjectsModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
