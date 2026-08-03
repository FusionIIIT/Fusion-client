/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, TextInput, Text, Group, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { MantineReactTable } from "mantine-react-table";

export default function ModuleList({ data = [], onSubmit }) {
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
        ModuleList
      </Text>
      <MantineReactTable columns={columns} data={data} />
    </Box>
  );
}

ModuleList.propTypes = {
  data: PropTypes.array,
  onSubmit: PropTypes.func,
};
