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
import { hodDpgcReviewOpenSeminarRoute } from "../../../routes/academicRoutes";
import { authHeaders, OPEN_SEMINAR_SHAPE } from "./openSeminarShared";

export default function HODDpgcApproveOpenSeminarModal({
  seminar,
  onClose,
  refresh,
}) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodDpgcReviewOpenSeminarRoute(seminar.id),
        { approve, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Forwarded" : "Rejected",
        message: approve
          ? "Forwarded to Dean Academic."
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
    <Modal
      opened
      onClose={onClose}
      title="Convener (DPGC) Approval — Open Seminar"
      size="70%"
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
                <Text fw={500}>Proposed Date</Text>
              </td>
              <td>{seminar.proposed_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>
                  Credits (Course Work / Progress Seminar / Thesis Research /
                  Teaching)
                </Text>
              </td>
              <td>
                {seminar.course_work_credits} /{" "}
                {seminar.progress_seminar_credits} /{" "}
                {seminar.thesis_research_credits} / {seminar.teaching_credits} ={" "}
                {seminar.total_credits} total
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>RPC Recommended Open Seminar?</Text>
              </td>
              <td>{seminar.rpc_recommended_open_seminar ? "Yes" : "No"}</td>
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
            {seminar.committee.map((m) => (
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

HODDpgcApproveOpenSeminarModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
