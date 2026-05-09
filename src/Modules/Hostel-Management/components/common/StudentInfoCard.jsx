import React from "react";
import PropTypes from "prop-types";
import { Card, Text, Badge, Group, Stack, Avatar, Box } from "@mantine/core";

export default function StudentInfoCard({
  student,
  onClick,
  clickable = true,
}) {
  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      style={{
        cursor: clickable ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": clickable
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }
          : {},
      }}
      onClick={clickable ? onClick : undefined}
    >
      <Stack spacing="sm">
        <Group>
          <Avatar name={student?.id__user__username || "N/A"} radius="xl" />
          <Box style={{ flex: 1 }}>
            <Text weight={500} size="sm">
              {student?.id__user__username || "N/A"}
            </Text>
            <Text size="xs" color="dimmed">
              {student?.id__user__first_name || ""}
            </Text>
          </Box>
        </Group>

        <Stack spacing={4}>
          <Group spacing="xs">
            <Text size="xs" weight={500} color="dimmed">
              Room:
            </Text>
            <Badge size="sm" variant="light">
              {student?.room_no || "Not Assigned"}
            </Badge>
          </Group>

          <Group spacing="xs">
            <Text size="xs" weight={500} color="dimmed">
              Block:
            </Text>
            <Text size="xs">{student?.hall || "N/A"}</Text>
          </Group>

          <Group spacing="xs">
            <Text size="xs" weight={500} color="dimmed">
              Batch:
            </Text>
            <Text size="xs">{student?.batch || "N/A"}</Text>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

StudentInfoCard.propTypes = {
  student: PropTypes.shape({
    id__user__username: PropTypes.string,
    id__user__first_name: PropTypes.string,
    room_no: PropTypes.string,
    hall: PropTypes.string,
    batch: PropTypes.string,
  }),
  onClick: PropTypes.func,
  clickable: PropTypes.bool,
};

StudentInfoCard.defaultProps = {
  student: {},
  onClick: () => {},
  clickable: true,
};
