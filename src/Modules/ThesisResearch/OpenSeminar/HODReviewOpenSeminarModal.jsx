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
import { hodReviewOpenSeminarRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  OPEN_SEMINAR_SHAPE,
} from "./openSeminarShared";

export default function HODReviewOpenSeminarModal({
  seminar,
  onClose,
  refresh,
}) {
  const attempt = currentAttempt(seminar);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodReviewOpenSeminarRoute(attempt.id),
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
    <Modal
      opened
      onClose={onClose}
      title="Convener (DPGC) Post-RPC Review"
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
                <Text fw={500}>Supervisor</Text>
              </td>
              <td>{seminar.supervisor?.name || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Co-Supervisor</Text>
              </td>
              <td>
                {seminar.co_supervisor ? seminar.co_supervisor.name : "—"}
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
                <Text fw={500}>Date of Seminar</Text>
              </td>
              <td>{attempt?.seminar_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Candidate&apos;s Performance</Text>
              </td>
              <td>
                {attempt?.result === "satisfactory"
                  ? "Satisfactory"
                  : attempt?.result === "not_satisfactory"
                    ? "Not Satisfactory"
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
            {seminar.committee.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
              </tr>
            ))}
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

HODReviewOpenSeminarModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
