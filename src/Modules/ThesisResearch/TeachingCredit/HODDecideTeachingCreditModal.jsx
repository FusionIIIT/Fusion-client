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
import { hodDecideTeachingCreditRoute } from "../../../routes/academicRoutes";
import { authHeaders, REGISTRATION_SHAPE } from "./teachingCreditShared";

export default function HODDecideTeachingCreditModal({
  registration,
  onClose,
  refresh,
}) {
  const [allocatedCourse, setAllocatedCourse] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const choiceOpts = registration.choices
    .filter(Boolean)
    .map((c) => ({ value: String(c.id), label: `${c.code} — ${c.name}` }));

  const handle = async (allocate) => {
    if (allocate && !allocatedCourse) {
      showNotification({
        title: "Missing field",
        message: "Select one of the student's choices to allocate.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        hodDecideTeachingCreditRoute(registration.id),
        { allocate, allocated_course: allocatedCourse, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: allocate ? "Allocated" : "Sent Back",
        message: allocate
          ? "Course allocated to the student."
          : "Sent back to the student for revision.",
        color: allocate ? "green" : "yellow",
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
    <Modal opened onClose={onClose} title="Teaching Credit — Decide" size="60%">
      <Stack gap="md">
        <Table striped highlightOnHover>
          <tbody>
            <tr>
              <td>
                <Text fw={500}>Student</Text>
              </td>
              <td>
                {registration.student_name} ({registration.student_roll})
              </td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Discipline</Text>
              </td>
              <td>{registration.student_discipline}</td>
            </tr>
            <tr>
              <td>
                <Text fw={500}>Semester</Text>
              </td>
              <td>{registration.semester_no}</td>
            </tr>
          </tbody>
        </Table>

        <Select
          label="Allocate Course (must be one of the student's choices)"
          data={choiceOpts}
          value={allocatedCourse}
          onChange={setAllocatedCourse}
        />
        <Textarea
          label="Remarks (if sending back)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Allocate Course
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Student
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODDecideTeachingCreditModal.propTypes = {
  registration: REGISTRATION_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
