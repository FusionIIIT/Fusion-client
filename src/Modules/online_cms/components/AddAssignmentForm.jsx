/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Paper, Text, TextInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

export default function AddAssignmentForm({ courseCode, onSuccess }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState(null);
  const canSubmit = useMemo(
    () => title.trim().length > 0 && Boolean(deadline),
    [title, deadline],
  );

  if (!courseCode) {
    return (
      <Paper p="md" shadow="xs">
        <Text c="dimmed">Select a course to create an assignment.</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        Create Assignment
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onSuccess?.({
            title: title.trim(),
            deadline: deadline.toISOString(),
          });
          setTitle("");
          setDeadline(null);
        }}
      >
        <TextInput
          label="Title"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          mb="sm"
          required
        />
        <DateTimePicker
          label="Deadline"
          placeholder="Pick deadline"
          value={deadline}
          onChange={setDeadline}
          mb="sm"
          required
        />
        <Group mt="md">
          <Button type="submit" disabled={!canSubmit}>
            Create
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

AddAssignmentForm.propTypes = {
  courseCode: PropTypes.string,
  onSuccess: PropTypes.func,
};
