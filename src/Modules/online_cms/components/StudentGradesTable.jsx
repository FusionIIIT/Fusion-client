/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, TextInput, Text, Group, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

export default function StudentGradesTable({ data = [], onSubmit }) {
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
        StudentGradesTable
      </Text>
      <MantineReactTable columns={columns} data={data} />
    </Box>
  );
}

StudentGradesTable.propTypes = {
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
