/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, TextInput, Text, Group, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

export default function ForumWorkspace({ data = [], onSubmit }) {
  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">
        ForumWorkspace
      </Text>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit();
        }}
      >
        <TextInput label="Name" placeholder="Enter name" mb="sm" required />
        <TextInput
          label="Description"
          placeholder="Enter description"
          mb="sm"
        />
        <DatePickerInput label="Date" placeholder="Select date" mb="sm" />
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Paper>
  );
}

ForumWorkspace.propTypes = {
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
