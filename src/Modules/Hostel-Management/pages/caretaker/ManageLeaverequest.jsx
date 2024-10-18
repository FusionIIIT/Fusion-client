import React from "react";
import {
  Text,
  Paper,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
  ScrollArea,
  Badge,
  Box,
} from "@mantine/core";
import { CalendarBlank } from "@phosphor-icons/react";

const leaveRequests = [
  {
    id: "1",
    name: "Vishal Keshari",
    leaveType: "Sick Leave",
    startDate: "2023-06-15",
    endDate: "2023-06-17",
    reason: "Caught a flu, need rest for recovery.",
  },
  {
    id: "2",
    name: "Tushar Sharma",
    leaveType: "Casual Leave",
    startDate: "2023-06-18",
    endDate: "2023-06-20",
    reason: "Family function to attend.",
  },
  {
    id: "3",
    name: "Akshay Behl",
    leaveType: "Annual Leave",
    startDate: "2023-06-21",
    endDate: "2023-06-23",
    reason: "Planned vacation with family.",
  },
  {
    id: "4",
    name: "Ayodhya",
    leaveType: "Sick Leave",
    startDate: "2023-06-24",
    endDate: "2023-06-26",
    reason: "Recovering from a minor surgery.",
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
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: "fixed",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Text
        align="left"
        mb="xl"
        size="24px"
        style={{ color: "#757575", fontWeight: "bold" }}
      >
        Manage Leave Request
      </Text>

      <ScrollArea style={{ flex: 1, height: "calc(66vh)" }}>
        <Stack spacing="md" pb="md">
          {leaveRequests.map((request) => (
            <Paper
              key={request.id}
              p="md"
              withBorder
              shadow="xs"
              sx={(theme) => ({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: theme.white,
                borderColor: theme.colors.gray[3],
              })}
            >
              <Flex
                align="stretch"
                justify="space-between"
                style={{ width: "100%", minHeight: "100px" }}
              >
                <Group
                  spacing="md"
                  style={{ flex: "0 0 auto", marginRight: "1rem" }}
                >
                  <Avatar color="cyan" radius="xl" size="lg">
                    {request.name[0]}
                  </Avatar>
                  <div>
                    <Text weight={500} size="sm" lineClamp={1}>
                      {request.name}
                    </Text>
                    <Badge size="sm" variant="outline" color="blue">
                      {request.leaveType}
                    </Badge>
                  </div>
                </Group>

                <Box
                  sx={(theme) => ({
                    flex: "1 1 auto",
                    borderLeft: `1px solid ${theme.colors.gray[3]}`,
                    borderRight: `1px solid ${theme.colors.gray[3]}`,
                    padding: theme.spacing.xs,
                    marginRight: theme.spacing.md,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      padding: theme.spacing.sm,
                      backgroundColor: theme.colors.gray[0],
                      borderRadius: theme.radius.sm,
                      border: `1px solid ${theme.colors.gray[2]}`,
                    })}
                  >
                    <Text
                      size="sm"
                      style={(theme) => ({
                        overflowWrap: "break-word",
                        lineHeight: 1.5,
                        fontWeight: 500,
                        color: theme.colors.gray[7],
                      })}
                    >
                      {request.reason}
                    </Text>
                  </Box>
                </Box>

                <Flex
                  direction="column"
                  justify="space-between"
                  style={{ flex: "0 0 auto", minWidth: "200px" }}
                >
                  <div>
                    <Group spacing="xs" mb="xs">
                      <CalendarBlank size={16} />
                      <Text size="xs" color="dimmed">
                        From:
                      </Text>
                      <Text size="sm">{request.startDate}</Text>
                    </Group>
                    <Group spacing="xs">
                      <CalendarBlank size={16} />
                      <Text size="xs" color="dimmed">
                        To:
                      </Text>
                      <Text size="sm">{request.endDate}</Text>
                    </Group>
                  </div>
                  <Group spacing="xs" mt="auto">
                    <Button
                      color="green"
                      variant="outline"
                      size="xs"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      color="red"
                      variant="outline"
                      size="xs"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </Button>
                  </Group>
                </Flex>
              </Flex>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
