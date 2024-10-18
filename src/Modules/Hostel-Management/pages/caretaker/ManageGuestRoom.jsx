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
} from "@mantine/core";
import {
  CalendarBlank,
  CheckCircle,
  XCircle,
  Bed,
} from "@phosphor-icons/react";

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
        Manage Guest Room Request
      </Text>

      <ScrollArea style={{ flex: 1, height: "calc(66vh)" }}>
        <Stack spacing="md" pb="md">
          {guestRoomRequests.map((request) => (
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
                align="center"
                justify="space-between"
                style={{ width: "100%" }}
              >
                <Group spacing="md" noWrap>
                  <Avatar color="blue" radius="xl">
                    {request.name[0]}
                  </Avatar>
                  <div>
                    <Text weight={500} size="sm" lineClamp={1}>
                      {request.name}
                    </Text>
                    <Badge
                      size="sm"
                      variant="outline"
                      color="blue"
                      leftSection={<Bed size={12} />}
                    >
                      {request.roomType}
                    </Badge>
                  </div>
                </Group>
                <Group spacing="md" noWrap>
                  <Flex direction="column" align="flex-start">
                    <Group spacing="xs" noWrap>
                      <CalendarBlank size={16} />
                      <Text size="xs" color="dimmed">
                        Check-in:
                      </Text>
                      <Text size="sm">{request.checkIn}</Text>
                    </Group>
                    <Group spacing="xs" noWrap>
                      <CalendarBlank size={16} />
                      <Text size="xs" color="dimmed">
                        Check-out:
                      </Text>
                      <Text size="sm">{request.checkOut}</Text>
                    </Group>
                  </Flex>
                  <Group spacing="xs" noWrap>
                    <Button
                      leftIcon={<CheckCircle size={16} />}
                      color="green"
                      variant="outline"
                      size="xs"
                      onClick={() => handleApprove(request.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      leftIcon={<XCircle size={16} />}
                      color="red"
                      variant="outline"
                      size="xs"
                      onClick={() => handleDecline(request.id)}
                    >
                      Decline
                    </Button>
                  </Group>
                </Group>
              </Flex>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
