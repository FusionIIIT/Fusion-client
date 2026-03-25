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
  const columns = React.useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "startTime", header: "Start" },
      { accessorKey: "endTime", header: "End" },
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
        enableRowActions
        positionActionsColumn="last"
        renderRowActions={({ row }) => {
          const quiz = row.original;
          return (
            <Group gap="xs">
              {isFaculty ? (
                <Button
                  color="red"
                  variant="light"
                  size="xs"
                  onClick={() => onRemove?.(quiz.id)}
                >
                  Remove
                </Button>
              ) : (
                <Button size="xs" onClick={() => onStart?.(quiz)}>
                  Start
                </Button>
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
