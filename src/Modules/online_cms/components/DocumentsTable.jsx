/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Anchor, Box, Button, Group, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";

export default function DocumentsTable({
  documents = [],
  onDelete,
  isFaculty,
}) {
  const columns = React.useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "url",
        header: "Link",
        Cell: ({ cell }) => {
          const href = cell.getValue();
          return href ? (
            <Anchor href={href} target="_blank" rel="noreferrer">
              Open
            </Anchor>
          ) : (
            ""
          );
        },
      },
      { accessorKey: "uploadedAt", header: "Uploaded" },
    ],
    [],
  );

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        Materials
      </Text>
      <MantineReactTable
        columns={columns}
        data={documents}
        enableRowActions={Boolean(isFaculty && onDelete)}
        positionActionsColumn="last"
        renderRowActions={({ row }) => {
          const m = row.original;
          if (!isFaculty || !onDelete) return null;
          return (
            <Group gap="xs">
              <Button
                color="red"
                variant="light"
                size="xs"
                onClick={() => onDelete(m.id)}
              >
                Delete
              </Button>
            </Group>
          );
        }}
      />
    </Box>
  );
}

DocumentsTable.propTypes = {
  documents: PropTypes.array,
  onDelete: PropTypes.func,
  isFaculty: PropTypes.bool,
};
