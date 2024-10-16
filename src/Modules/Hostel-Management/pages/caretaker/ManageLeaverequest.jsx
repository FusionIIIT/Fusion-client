import React from "react";
import {
  Box,
  Text,
  Paper,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
} from "@mantine/core";

const leaveRequests = [
  {
    id: "1",
    name: "Vishal Keshari",
    leaveType: "Sick Leave",
    startDate: "2023-06-15",
    endDate: "2023-06-17",
  },
  {
    id: "2",
    name: "Tushar Sharma",
    leaveType: "Casual Leave",
    startDate: "2023-06-18",
    endDate: "2023-06-20",
  },
  {
    id: "3",
    name: "Akshay Behl",
    leaveType: "Annual Leave",
    startDate: "2023-06-21",
    endDate: "2023-06-23",
  },
  {
    id: "4",
    name: "Ayodhya",
    leaveType: "Sick Leave",
    startDate: "2023-06-24",
    endDate: "2023-06-26",
  },
];

export default function ManageLeaveRequest() {
  const handleAccept = (id) => {
    console.log(`Accepted leave request for id: ${id}`);
  };

  const handleReject = (id) => {
    console.log(`Rejected leave request for id: ${id}`);
  };

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colors.gray[0],
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
      })}
    >
      <Text size="xl" weight={500} mb="md">
        Manage Leave Request
      </Text>
      <Paper p="md" radius="md">
        <Stack spacing="md">
          {leaveRequests.map((request) => (
            <Paper key={request.id} p="md" withBorder>
              <Flex wrap="wrap" align="center" justify="space-between">
                <Group
                  spacing="md"
                  noWrap
                  style={{
                    minWidth: "200px",
                    flex: "1 1 25%",
                    marginBottom: "8px",
                  }}
                >
                  <Avatar color="cyan" radius="xl">
                    {request.name[0]}
                  </Avatar>
                  <Text weight={500} size="sm" lineClamp={1}>
                    {request.name}
                  </Text>
                </Group>
                <Text
                  color="dimmed"
                  size="sm"
                  style={{
                    flex: "1 1 15%",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  {request.leaveType}
                </Text>
                <Flex
                  direction="column"
                  align="flex-start"
                  style={{ flex: "1 1 30%", marginBottom: "8px" }}
                >
                  <Group spacing="xs" noWrap>
                    <Text size="xs" color="dimmed">
                      From:
                    </Text>
                    <Text size="sm">{request.startDate}</Text>
                  </Group>
                  <Group spacing="xs" noWrap>
                    <Text size="xs" color="dimmed">
                      To:
                    </Text>
                    <Text size="sm">{request.endDate}</Text>
                  </Group>
                </Flex>
                <Group
                  spacing="xs"
                  noWrap
                  style={{
                    flex: "1 1 25%",
                    justifyContent: "flex-end",
                    marginBottom: "8px",
                  }}
                >
                  <Button
                    color="green"
                    variant="filled"
                    size="xs"
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    color="red"
                    variant="filled"
                    size="xs"
                    onClick={() => handleReject(request.id)}
                  >
                    Reject
                  </Button>
                </Group>
              </Flex>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
