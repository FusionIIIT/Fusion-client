/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, TextInput, Text, Group, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

export default function TopicTable({ data = [], onSubmit }) {
  const columns = React.useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
    ],
    [],
  );

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        TopicTable
      </Text>
      <MantineReactTable columns={columns} data={data} />
    </Box>
  );
}

TopicTable.propTypes = {
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
