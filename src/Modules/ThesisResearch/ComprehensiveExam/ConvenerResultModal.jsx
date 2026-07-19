import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Select,
  Textarea,
  FileInput,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { convenerSubmitResultRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  currentAttempt,
  EXAM_SHAPE,
} from "./comprehensiveExamShared";

export default function ConvenerResultModal({ exam, onClose, refresh }) {
  const attempt = currentAttempt(exam);
  const [form, setForm] = useState({
    result: "",
    fundamentals_comment: "",
    problem_identification_comment: "",
    plan_of_work_comment: "",
    suggestions_comment: "",
    additional_literature_comment: "",
  });
  const [milestoneFile, setMilestoneFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.result) {
      showNotification({
        title: "Result required",
        message: "Select Passed or Failed.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (milestoneFile) fd.append("milestone_plan", milestoneFile);

      await axios.post(convenerSubmitResultRoute(attempt.id), fd, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      showNotification({
        title: "Result Recorded",
        message:
          form.result === "passed"
            ? "Student has passed."
            : "Attempt marked failed.",
        color: form.result === "passed" ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
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
      title="Comprehensive Examination Report"
      size="80%"
    >
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
                <Text fw={500}>Attempt</Text>
              </td>
              <td>
                {exam.current_attempt_number} / {exam.max_attempts}
              </td>
            </tr>
          </tbody>
        </Table>

        <Text fw={500}>Opted Subjects</Text>
        <Table striped highlightOnHover>
          <tbody>
            {attempt?.subjects
              .filter((s) => s.selected_by_student)
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.subject_name}</td>
                </tr>
              ))}
          </tbody>
        </Table>

        <Select
          label="Candidate's Performance"
          data={[
            { value: "passed", label: "Passed" },
            { value: "failed", label: "Failed" },
          ]}
          value={form.result}
          onChange={set("result")}
          required
        />
        <Textarea
          label="Comment on Fundamentals"
          value={form.fundamentals_comment}
          onChange={(e) => set("fundamentals_comment")(e.target.value)}
          minRows={2}
        />
        <Textarea
          label="Comment on Problem Identification"
          value={form.problem_identification_comment}
          onChange={(e) =>
            set("problem_identification_comment")(e.target.value)
          }
          minRows={2}
        />
        <Textarea
          label="Comment on Plan of Work"
          value={form.plan_of_work_comment}
          onChange={(e) => set("plan_of_work_comment")(e.target.value)}
          minRows={2}
        />
        <Textarea
          label="Other Suggestions for Improvement"
          value={form.suggestions_comment}
          onChange={(e) => set("suggestions_comment")(e.target.value)}
          minRows={2}
        />
        <Textarea
          label="Additional Literature to be Studied"
          value={form.additional_literature_comment}
          onChange={(e) => set("additional_literature_comment")(e.target.value)}
          minRows={2}
        />
        <FileInput
          label="Plan of PhD with Milestones (required attachment)"
          value={milestoneFile}
          onChange={setMilestoneFile}
          accept="application/pdf,image/*"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit Report
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ConvenerResultModal.propTypes = {
  exam: EXAM_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
