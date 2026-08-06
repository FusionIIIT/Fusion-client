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
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  facultyListRoute,
  deanAppointNomineeOpenSeminarRoute,
} from "../../../routes/academicRoutes";
import { authHeaders, OPEN_SEMINAR_SHAPE } from "./openSeminarShared";
import { host } from "../../../routes/globalRoutes";

export default function DeanAppointNomineeModal({ seminar, onClose, refresh }) {
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
        deanAppointNomineeOpenSeminarRoute(seminar.id),
        { approve, dean_nominee_id: deanNomineeId, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: approve ? "Approved" : "Rejected",
        message: approve
          ? "Dean Nominee appointed; the RPC can now begin review."
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
      title="Appoint Dean Nominee — Open Seminar"
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
                <Text fw={500}>Total Credits</Text>
              </td>
              <td>{seminar.total_credits ?? "—"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>RPC Recommended Open Seminar?</Text>
              </td>
              <td>{seminar.rpc_recommended_open_seminar ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>1st Draft of Thesis</Text>
              </td>
              <td>
                {seminar.first_draft_document_url ? (
                  <Anchor
                    href={
                      seminar.first_draft_document_url.startsWith("http")
                        ? seminar.first_draft_document_url
                        : `${host}${seminar.first_draft_document_url.startsWith("/") ? "" : "/"}${seminar.first_draft_document_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View uploaded draft
                  </Anchor>
                ) : (
                  "—"
                )}
              </td>
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
            Approve
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

DeanAppointNomineeModal.propTypes = {
  seminar: OPEN_SEMINAR_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
