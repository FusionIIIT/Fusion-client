/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Paper, Select, Text, TextInput } from "@mantine/core";

export default function AssignmentUploadForm({
  courseCode,
  assignments = [],
  onSuccess,
}) {
  const [assignmentId, setAssignmentId] = useState(null);
  const [link, setLink] = useState("");

  const options = useMemo(
    () =>
      (assignments || []).map((a) => ({
        value: String(a.id),
        label: `${a.title}${a.deadline ? ` (due ${a.deadline})` : ""}`,
      })),
    [assignments],
  );

  const canSubmit = useMemo(
    () =>
      Boolean(courseCode) && Boolean(assignmentId) && link.trim().length > 0,
    [courseCode, assignmentId, link],
  );

  if (!courseCode) {
    return (
      <Paper p="md" shadow="xs">
        <Text c="dimmed">Select a course to submit an assignment.</Text>
      </Paper>
    );
  }

  if (options.length === 0) {
    return (
      <Paper p="md" shadow="xs">
        <Text size="xl" mb="md" fw={500}>
          Submit Assignment
        </Text>
        <Text c="dimmed">No assignments available for this course yet.</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md" fw={500}>
        Submit Assignment
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onSuccess?.({
            assignment_id: Number(assignmentId),
            submission_link: link.trim(),
          });
          setLink("");
        }}
      >
        <Select
          label="Assignment"
          placeholder="Select assignment"
          data={options}
          value={assignmentId}
          onChange={setAssignmentId}
          mb="sm"
          searchable
          required
          clearable
        />
        <TextInput
          label="Submission link"
          placeholder="Paste your Google Drive / GitHub / any link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          mb="sm"
          required
          description="Provide a link to your assignment submission"
        />
        <Group mt="md">
          <Button type="submit" disabled={!canSubmit} fullWidth>
            Submit Assignment
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

AssignmentUploadForm.propTypes = {
  courseCode: PropTypes.string,
  assignments: PropTypes.array,
  onSuccess: PropTypes.func,
};
