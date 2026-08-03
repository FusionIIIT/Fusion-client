/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Paper, Text, TextInput } from "@mantine/core";

export default function DocumentUploadForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await onSubmit?.({ title, description, url });
    setTitle("");
    setDescription("");
    setUrl("");
  };

  return (
    <Paper p="md" shadow="xs" mb="md">
      <Text size="lg" mb="sm">
        Add Course Material
      </Text>
      <form onSubmit={submit}>
        <TextInput
          label="Title"
          placeholder="e.g., Lecture 1 Slides"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          mb="sm"
        />
        <TextInput
          label="Link"
          placeholder="Paste Google Drive / Dropbox / GitHub link"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          required
          mb="sm"
        />
        <TextInput
          label="Description (optional)"
          placeholder="Short note for students"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          mb="sm"
        />
        <Group mt="md">
          <Button type="submit">Add</Button>
        </Group>
      </form>
    </Paper>
  );
}

DocumentUploadForm.propTypes = {
  onSubmit: PropTypes.func,
};
