/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, TextInput, Text, Group, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

export default function GradingSchemeTable({ data = [], onSubmit }) {
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
        GradingSchemeTable
      </Text>
      <MantineReactTable columns={columns} data={data} />
    </Box>
  );
}

GradingSchemeTable.propTypes = {
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
