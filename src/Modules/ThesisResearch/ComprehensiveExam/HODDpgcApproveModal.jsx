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
import { hodDpgcApproveComprehensiveExamRoute } from "../../../routes/academicRoutes";
import { authHeaders, EXAM_SHAPE } from "./comprehensiveExamShared";

export default function HODDpgcApproveModal({ exam, onClose, refresh }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodDpgcApproveComprehensiveExamRoute(exam.id),
        { approve, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Forwarded" : "Rejected",
        message: approve
          ? "The student's RPC can now begin the exam review."
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
    <Modal opened onClose={onClose} title="Convener (DPGC) Approval" size="70%">
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
                <Text fw={500}>Proposed Date of Examination</Text>
              </td>
              <td>{exam.proposed_exam_date || "—"}</td>
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
            {exam.committee.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.discipline}</td>
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
            Forward
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODDpgcApproveModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
