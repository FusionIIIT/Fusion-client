import React, { useState } from "react";
import {
  Text,
  Paper,
  Group,
  Avatar,
  Button,
  Stack,
  Flex,
  Select,
  ScrollArea,
  Badge,
} from "@mantine/core";
import {
  Student,
  CalendarBlank,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";

const manageFines = [
  {
    id: "1",
    name: "Vishal Keshari",
    hall: "Hall-2",
    finedDate: "2023-06-15",
    status: "unpaid",
  },
  {
    id: "2",
    name: "Tushar Sharma",
    hall: "Hall-1",
    finedDate: "2023-06-18",
    status: "paid",
  },
  {
    id: "3",
    name: "Akshay Behl",
    hall: "Hall-3",
    finedDate: "2023-06-21",
    status: "unpaid",
  },
  {
    id: "4",
    name: "Ayodhya",
    hall: "Hall-2",
    finedDate: "2023-06-24",
    status: "unpaid",
  },
  {
    id: "5",
    name: "Devanshi Gupta",
    hall: "Maa Saraswati Hostel",
    finedDate: "2023-07-01",
    status: "paid",
  },
];

export default function ManageFines() {
  const [selectedHall, setSelectedHall] = useState("");

  const handleMarkPaid = (id) => {
    console.log(`Marked fine as paid for id: ${id}`);
  };

  const handleMarkUnpaid = (id) => {
    console.log(`Marked fine as unpaid for id: ${id}`);
  };

  const handleHallChange = (value) => {
    setSelectedHall(value);
  };

  const filteredFines = selectedHall
    ? manageFines.filter((fine) => fine.hall === selectedHall)
    : manageFines;

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
        Manage Fines
      </Text>

      <ScrollArea style={{ flex: 1, height: "calc(66vh)" }}>
        <Stack spacing="md" pb="md">
          <Select
            label="Filter by Hostel"
            placeholder="Select a hostel"
            icon={<Student size={16} />}
            data={[
              { value: "Hall-1", label: "Hall-1" },
              { value: "Hall-2", label: "Hall-2" },
              { value: "Hall-3", label: "Hall-3" },
              { value: "Hall-4", label: "Hall-4" },
              { value: "Hall-5", label: "Hall-5" },
              { value: "Maa Saraswati Hostel", label: "Maa Saraswati Hostel" },
            ]}
            value={selectedHall}
            onChange={handleHallChange}
          />

          {filteredFines.length > 0 ? (
            filteredFines.map((fine) => (
              <Paper
                key={fine.id}
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
                    <Avatar color="cyan" radius="xl">
                      {fine.name[0]}
                    </Avatar>
                    <div>
                      <Text weight={500} size="sm" lineClamp={1}>
                        {fine.name}
                      </Text>
                      <Text color="dimmed" size="xs">
                        {fine.hall}
                      </Text>
                    </div>
                  </Group>
                  <Group spacing="md" noWrap>
                    <Group spacing="xs" noWrap>
                      <CalendarBlank size={16} />
                      <Text size="sm">{fine.finedDate}</Text>
                    </Group>
                    <Badge
                      size="sm"
                      variant="filled"
                      color={fine.status === "paid" ? "green" : "red"}
                    >
                      {fine.status}
                    </Badge>
                    {fine.status === "unpaid" ? (
                      <Button
                        leftIcon={<CheckCircle size={16} />}
                        color="green"
                        variant="outline"
                        size="xs"
                        onClick={() => handleMarkPaid(fine.id)}
                      >
                        Mark as Paid
                      </Button>
                    ) : (
                      <Button
                        leftIcon={<XCircle size={16} />}
                        color="red"
                        variant="outline"
                        size="xs"
                        onClick={() => handleMarkUnpaid(fine.id)}
                      >
                        Mark as Unpaid
                      </Button>
                    )}
                  </Group>
                </Flex>
              </Paper>
            ))
          ) : (
            <Text align="center" color="dimmed" size="lg">
              No fines for the selected hostel.
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
