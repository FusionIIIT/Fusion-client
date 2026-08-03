/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Text, Group, Paper, Textarea } from "@mantine/core";

export default function ForumQuestionForm({ courseCode, data = [], onSubmit }) {
  const [message, setMessage] = useState("");
  const canSubmit = useMemo(() => message.trim().length > 0, [message]);

  if (!courseCode) {
    return (
      <Paper p="md" shadow="xs">
        <Text c="dimmed">Select a course to post in the forum.</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        New Forum Post
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          if (onSubmit) onSubmit({ message: message.trim() });
          setMessage("");
        }}
      >
        <Textarea
          label="Message"
          placeholder="Write a post..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          mb="sm"
          autosize
          minRows={2}
          required
        />
        <Group mt="md">
          <Button type="submit" disabled={!canSubmit}>
            Post
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

ForumQuestionForm.propTypes = {
  courseCode: PropTypes.string,
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
