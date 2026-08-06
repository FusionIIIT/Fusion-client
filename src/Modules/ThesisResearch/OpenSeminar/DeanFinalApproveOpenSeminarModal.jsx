import React, { useState } from "react";
import { Modal, Text, Table, Button, Stack, Group } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { deanApproveOpenSeminarRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  OPEN_SEMINAR_SHAPE,
} from "./openSeminarShared";

export default function DeanFinalApproveOpenSeminarModal({
  seminar,
  onClose,
  refresh,
}) {
  const attempt = currentAttempt(seminar);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post(
        deanApproveOpenSeminarRoute(attempt.id),
        {},
        { headers: authHeaders() },
      );
      showNotification({
        title: "Approved",
        message:
          attempt.result === "satisfactory"
            ? "Student's Open Seminar is now Satisfactory."
            : "Attempt closed as Not Satisfactory.",
        color: attempt.result === "satisfactory" ? "green" : "yellow",
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
    <Modal
      opened
      onClose={onClose}
      title="Dean Academic — Final Approval"
      size="80%"
    >
      <Stack gap="md">
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
                <Text fw={500}>Attempt</Text>
              </td>
              <td>{attempt?.attempt_number}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Date of Seminar</Text>
              </td>
              <td>{attempt?.seminar_date || "—"}</td>
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
            {seminar.committee.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Text fw={500}>Committee's Verdict</Text>
        <Table striped highlightOnHover mb="md">
          <tbody>
            <tr>
              <td>
                <b>Candidate&apos;s Performance</b>
              </td>
              <td>
                {attempt?.result === "satisfactory"
                  ? "Satisfactory"
                  : "Not Satisfactory"}
              </td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Committee Comments</Text>
        <Table striped highlightOnHover mb="md">
          <thead>
            <tr>
              <th>Member</th>
              <th>Timestamp</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {!attempt?.rpc_comments?.length && (
              <tr>
                <td colSpan={3}>—</td>
              </tr>
            )}
            {attempt?.rpc_comments?.map((c, idx) => (
              <tr key={idx}>
                <td>{c.member}</td>
                <td>{new Date(c.timestamp).toLocaleString()}</td>
                <td>{c.text}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Text fw={500}>
          Dean Nominee&apos;s Report
          {attempt?.dean_nominee ? ` — ${attempt.dean_nominee.name}` : ""}
        </Text>
        <Table striped highlightOnHover mb="md">
          <tbody>
            {!attempt?.dn_submitted_at ? (
              <tr>
                <td colSpan={2}>
                  <Text c="dimmed">
                    Not yet submitted (advisory only, does not gate approval)
                  </Text>
                </td>
              </tr>
            ) : (
              <>
                <tr>
                  <td>
                    <b>Quality of Work Done</b>
                  </td>
                  <td>{attempt.dn_quality || "—"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Quantity of Work Done</b>
                  </td>
                  <td>{attempt.dn_quantity || "—"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Publications</b>
                  </td>
                  <td>{attempt.dn_publications || "—"}</td>
                </tr>
                <tr>
                  <td>
                    <b>Overall Performance</b>
                  </td>
                  <td>
                    {attempt.dn_overall === "satisfactory"
                      ? "Satisfactory"
                      : attempt.dn_overall === "not_satisfactory"
                        ? "Not Satisfactory"
                        : "—"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Comments</b>
                  </td>
                  <td>{attempt.dn_comments || "—"}</td>
                </tr>
              </>
            )}
          </tbody>
        </Table>

        {attempt?.result === "not_satisfactory" && (
          <Text c="dimmed" size="sm">
            Since retries are unlimited, a new attempt will be created starting
            at RPC review.
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
            Approve {seminar.student_name}&apos;s Open Seminar as{" "}
            <Text
              span
              fw={700}
              c={attempt?.result === "satisfactory" ? "green" : "red"}
            >
              {attempt?.result === "satisfactory"
                ? "Satisfactory"
                : "Not Satisfactory"}
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

DeanFinalApproveOpenSeminarModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
