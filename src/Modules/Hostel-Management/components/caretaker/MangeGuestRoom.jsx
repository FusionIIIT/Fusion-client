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

const guestRoomRequests = [
  {
    id: "1",
    name: "Rahul Sharma",
    roomType: "Single",
    checkIn: "2023-06-20",
    checkOut: "2023-06-22",
  },
  {
    id: "2",
    name: "Priya Patel",
    roomType: "Double",
    checkIn: "2023-06-23",
    checkOut: "2023-06-25",
  },
  {
    id: "3",
    name: "Amit Kumar",
    roomType: "Single",
    checkIn: "2023-06-26",
    checkOut: "2023-06-28",
  },
  {
    id: "4",
    name: "Sneha Gupta",
    roomType: "Double",
    checkIn: "2023-06-29",
    checkOut: "2023-07-01",
  },
];

export default function ManageGuestRoomRequest() {
  const handleApprove = (id) => {
    console.log(`Approved guest room request for id: ${id}`);
  };

  const handleDecline = (id) => {
    console.log(`Declined guest room request for id: ${id}`);
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
        Manage Guest Room Request
      </Text>
      <Paper p="md" radius="md">
        <Stack spacing="md">
          {guestRoomRequests.map((request) => (
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
                  <Avatar color="blue" radius="xl">
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
                  {request.roomType}
                </Text>
                <Flex
                  direction="column"
                  align="flex-start"
                  style={{ flex: "1 1 30%", marginBottom: "8px" }}
                >
                  <Group spacing="xs" noWrap>
                    <Text size="xs" color="dimmed">
                      Check-in:
                    </Text>
                    <Text size="sm">{request.checkIn}</Text>
                  </Group>
                  <Group spacing="xs" noWrap>
                    <Text size="xs" color="dimmed">
                      Check-out:
                    </Text>
                    <Text size="sm">{request.checkOut}</Text>
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
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    color="red"
                    variant="filled"
                    size="xs"
                    onClick={() => handleDecline(request.id)}
                  >
                    Decline
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
