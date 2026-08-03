/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Group, Text } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";

export default function QuizListTable({
  quizzes = [],
  onRemove,
  onStart,
  isFaculty,
}) {
  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = React.useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "startTime",
        header: "Date & Time",
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
      },
      { accessorKey: "duration", header: "Duration (min)" },
    ],
    [],
  );

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        Quizzes
      </Text>
      <MantineReactTable
        columns={columns}
        data={quizzes}
        enableRowActions={isFaculty}
        enableColumnActions={false}
        positionActionsColumn="last"
        renderRowActions={({ row }) => {
          const quiz = row.original;
          return (
            <Group gap="xs">
              {isFaculty && (
                <>
                  <Button
                    color="red"
                    variant="light"
                    size="xs"
                    onClick={() => onRemove?.(quiz.id)}
                  >
                    Remove
                  </Button>
                </>
              )}
            </Group>
          );
        }}
      />
    </Box>
  );
}

QuizListTable.propTypes = {
  quizzes: PropTypes.array,
  onRemove: PropTypes.func,
  onStart: PropTypes.func,
  isFaculty: PropTypes.bool,
};
