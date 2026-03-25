/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Text, Group, Paper, TextInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

const DEFAULT_DURATION_MIN = 30;

export default function QuizCreateForm({ courseCode, data = [], onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(null);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!startTime) return false;
    return true;
  }, [title, startTime]);

  if (!courseCode) {
    return (
      <Paper p="md" shadow="xs">
        <Text c="dimmed">Select a course to create a quiz.</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        Create Quiz
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          if (onSubmit) {
            const start = startTime;
            const end = new Date(
              start.getTime() + DEFAULT_DURATION_MIN * 60 * 1000,
            );
            onSubmit({
              title: title.trim(),
              description: description.trim(),
              start_time: start.toISOString(),
              end_time: end.toISOString(),
            });
          }
        }}
      >
        <TextInput
          label="Title"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          mb="sm"
          required
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          mb="sm"
          autosize
          minRows={2}
        />

        <DateTimePicker
          label="Date & time"
          placeholder="Pick quiz date and time"
          value={startTime}
          onChange={setStartTime}
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

QuizCreateForm.propTypes = {
  courseCode: PropTypes.string,
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
