import React, { useState } from "react";
import { Modal, Text, Table, Button, Stack, Group } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { deanApproveComprehensiveExamRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  EXAM_SHAPE,
} from "./comprehensiveExamShared";

export default function DeanApproveModal({ exam, onClose, refresh }) {
  const attempt = currentAttempt(exam);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post(
        deanApproveComprehensiveExamRoute(attempt.id),
        {},
        { headers: authHeaders() },
      );
      showNotification({
        title: "Approved",
        message:
          attempt.result === "passed"
            ? "Student's comprehensive exam is now Passed."
            : "Attempt closed as Failed.",
        color: attempt.result === "passed" ? "green" : "yellow",
      });
      setConfirmOpen(false);
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
    <Modal opened onClose={onClose} title="Final Approval" size="70%">
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
                <Text fw={500}>Date of Examination</Text>
              </td>
              <td>{attempt?.exam_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Attempt</Text>
              </td>
              <td>
                {attempt?.attempt_number} / {exam.max_attempts}
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>
                  Candidate&apos;s Performance in Examination
                </Text>
              </td>
              <td>{attempt?.result === "passed" ? "Passed" : "Failed"}</td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Examination Committee (RPC)</Text>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Discipline</th>
            </tr>
          </thead>
          <tbody>
            {(!exam.committee || exam.committee.length === 0) && (
              <tr>
                <td colSpan={2}>
                  <Text c="dimmed">Not yet constituted</Text>
                </td>
              </tr>
            )}
            {(exam.committee || []).map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        {attempt?.result === "failed" &&
          exam.current_attempt_number < exam.max_attempts && (
            <Text c="dimmed" size="sm">
              Since attempts remain, a new attempt will be created starting at
              RPC review.
            </Text>
          )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setConfirmOpen(true)}>Approve</Button>
        </Group>
      </Stack>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Final Approval"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Approve {exam.student_name}&apos;s comprehensive exam as{" "}
            <Text
              span
              fw={700}
              c={attempt?.result === "passed" ? "green" : "red"}
            >
              {attempt?.result === "passed" ? "Passed" : "Failed"}
            </Text>
            ? This is final and cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Back
            </Button>
            <Button onClick={handleApprove} loading={loading}>
              Confirm Approve
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
}

DeanApproveModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
