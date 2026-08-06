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
import { hodPgcsReviewComprehensiveExamRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  EXAM_SHAPE,
} from "./comprehensiveExamShared";

export default function HODPgcsReviewModal({ exam, onClose, refresh }) {
  const attempt = currentAttempt(exam);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodPgcsReviewComprehensiveExamRoute(attempt.id),
        { approve, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Forwarded" : "Sent Back",
        message: approve
          ? "Forwarded to Dean Academic."
          : "Sent back to the RPC for fresh consensus.",
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
    <Modal opened onClose={onClose} title="Convener (PGCS) Review" size="80%">
      <Stack gap="md">
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
                <Text fw={500}>Attempt</Text>
              </td>
              <td>{attempt?.attempt_number}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Date of Examination</Text>
              </td>
              <td>{attempt?.exam_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>
                  Candidate&apos;s Performance in Examination
                </Text>
              </td>
              <td>
                {attempt?.result === "passed"
                  ? "Passed"
                  : attempt?.result === "failed"
                    ? "Failed"
                    : "—"}
              </td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Examination Committee (RPC)</Text>
        <Table striped highlightOnHover mb="md">
          <thead>
            <tr>
              <th>Name</th>
              <th>Discipline</th>
            </tr>
          </thead>
          <tbody>
            {exam.committee.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Text fw={500}>RPC Report</Text>
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <b>Fundamentals</b>
              </td>
              <td>{attempt?.fundamentals_comment || "—"}</td>
            </tr>
            <tr>
              <td>
                <b>Problem Identification</b>
              </td>
              <td>{attempt?.problem_identification_comment || "—"}</td>
            </tr>
            <tr>
              <td>
                <b>Plan of Work</b>
              </td>
              <td>{attempt?.plan_of_work_comment || "—"}</td>
            </tr>
            <tr>
              <td>
                <b>Suggestions</b>
              </td>
              <td>{attempt?.suggestions_comment || "—"}</td>
            </tr>
            <tr>
              <td>
                <b>Additional Literature</b>
              </td>
              <td>{attempt?.additional_literature_comment || "—"}</td>
            </tr>
          </tbody>
        </Table>

        <Textarea
          label="Remarks (if sending back to the RPC)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Forward to Dean Academic
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to RPC
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODPgcsReviewModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
