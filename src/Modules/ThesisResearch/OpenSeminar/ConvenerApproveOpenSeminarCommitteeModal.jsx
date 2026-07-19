import React, { useState, useEffect } from "react";
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
import {
  facultyListRoute,
  convenerApproveOpenSeminarCommitteeRoute,
} from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  OPEN_SEMINAR_SHAPE,
} from "./openSeminarShared";

export default function ConvenerApproveOpenSeminarCommitteeModal({
  seminar,
  onClose,
  refresh,
}) {
  const attempt = currentAttempt(seminar);
  const [facOpts, setFacOpts] = useState([]);
  const [deanNomineeId, setDeanNomineeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(facultyListRoute, { headers: authHeaders() })
      .then((res) =>
        setFacOpts(
          res.data.map((f) => ({ value: String(f.id), label: f.name })),
        ),
      )
      .catch(() => {});
  }, []);

  const handle = async (approve) => {
    if (approve && !deanNomineeId) {
      showNotification({
        title: "Dean Nominee required",
        message: "Appoint a Dean Nominee before approving.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        convenerApproveOpenSeminarCommitteeRoute(attempt.id),
        { approve, dean_nominee_id: deanNomineeId, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Approved" : "Rejected",
        message: approve
          ? "Committee approved; Dean Nominee appointed."
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
      title="Approve Open Seminar Committee"
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
                {seminar.student_name} ({seminar.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Supervisor</Text>
              </td>
              <td>{seminar.supervisor?.name}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Thesis Title</Text>
              </td>
              <td>{seminar.possible_thesis_title || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Proposed Date</Text>
              </td>
              <td>{attempt?.proposed_date || "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Total Credits</Text>
              </td>
              <td>{attempt?.total_credits ?? "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>RPC Recommended Open Seminar?</Text>
              </td>
              <td>{attempt?.rpc_recommended_open_seminar ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>1st Draft Sent to Dean?</Text>
              </td>
              <td>{attempt?.first_draft_sent_to_dean ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Committee</Text>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Discipline</th>
            </tr>
          </thead>
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
          label="Appoint Dean Nominee"
          data={facOpts}
          value={deanNomineeId}
          onChange={setDeanNomineeId}
          searchable
          required
        />
        <Textarea
          label="Remarks (if sending back)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Approve Committee
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ConvenerApproveOpenSeminarCommitteeModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
