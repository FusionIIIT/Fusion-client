import React, { useState } from "react";
import {
  Modal,
  Select,
  Textarea,
  Button,
  Text,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { studentSubmitTeachingCreditEvaluationRoute } from "../../../routes/academicRoutes";
import {
  authHeaders,
  BAND_OPTIONS,
  QUALITY_OPTIONS,
  REGISTRATION_SHAPE,
} from "./teachingCreditShared";

export default function StudentEvaluationModal({
  registration,
  onClose,
  refresh,
}) {
  const [form, setForm] = useState({
    punctuality_band: "",
    schedule_adherence_band: "",
    topics_sequence: "",
    teaching_aids: "",
    questions_answered: "",
    overall_effectiveness: "",
    strengths_weaknesses: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.overall_effectiveness) {
      showNotification({
        title: "Missing field",
        message: "Rate the overall effectiveness of teaching.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        studentSubmitTeachingCreditEvaluationRoute(registration.id),
        form,
        { headers: authHeaders() },
      );
      showNotification({
        title: "Submitted",
        message: "Your evaluation has been recorded confidentially.",
        color: "green",
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
      title="Student Evaluation for Teaching Credit"
      size="70%"
    >
      <Stack spacing="md">
        <Text size="sm" c="dimmed">
          Course: {registration.allocated_course?.code} —{" "}
          {registration.allocated_course?.name}. Your response is anonymous and
          will remain confidential.
        </Text>

        <Select
          label="Research Scholar was punctual in coming to the classes"
          data={BAND_OPTIONS}
          value={form.punctuality_band}
          onChange={set("punctuality_band")}
        />
        <Select
          label="Duration of most of the classes was as per schedule"
          data={BAND_OPTIONS}
          value={form.schedule_adherence_band}
          onChange={set("schedule_adherence_band")}
        />
        <Select
          label="Topics were covered in a logical sequence with even pace"
          data={QUALITY_OPTIONS}
          value={form.topics_sequence}
          onChange={set("topics_sequence")}
        />
        <Select
          label="Effective use of teaching aids (Board work/Presentation/Audio-Visual aids)"
          data={QUALITY_OPTIONS}
          value={form.teaching_aids}
          onChange={set("teaching_aids")}
        />
        <Select
          label="Questions raised in the class were satisfactorily answered"
          data={QUALITY_OPTIONS}
          value={form.questions_answered}
          onChange={set("questions_answered")}
        />
        <Select
          label="Overall effectiveness of teaching"
          data={QUALITY_OPTIONS}
          value={form.overall_effectiveness}
          onChange={set("overall_effectiveness")}
          required
        />
        <Textarea
          label="Strengths and Weaknesses of the Research Scholar"
          value={form.strengths_weaknesses}
          onChange={(e) => set("strengths_weaknesses")(e.target.value)}
          minRows={3}
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Submit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

StudentEvaluationModal.propTypes = {
  registration: REGISTRATION_SHAPE.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
