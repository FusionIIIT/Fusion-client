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

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
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
          placeholder={options.length ? "Select assignment" : "No assignments"}
          data={options}
          value={assignmentId}
          onChange={setAssignmentId}
          mb="sm"
          searchable
          required
        />
        <TextInput
          label="Submission link"
          placeholder="Paste your Google Drive / GitHub / any link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          mb="sm"
          required
        />
        <Group mt="md">
          <Button type="submit" disabled={!canSubmit}>
            Submit
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
