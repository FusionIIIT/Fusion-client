import React from "react";
import { Paper, Group, Text, Stack, Select, ScrollArea } from "@mantine/core";
import GuestRoomBookingCard from "../../components/students/GuestRoomBookingCard";

export default function GuestRoomBookingStatus() {
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
      <ScrollArea style={{ flex: 1 }}>
        <Text
          align="left"
          mb="xl"
          size="24px"
          style={{ color: "#757575", fontWeight: "bold" }}
        >
          Guest Room Booking Status
        </Text>
        <Stack spacing="xl">
          <Stack spacing="md">
            <Group position="apart" align="center">
              <Text weight={500} size="xl" color="dimmed">
                Active Bookings
              </Text>
              <Group spacing="xs">
                <Text size="sm" color="dimmed">
                  Sort By:
                </Text>
                <Select
                  placeholder="Date"
                  data={[
                    { value: "checkInDate", label: "Check-in Date" },
                    { value: "bookingDate", label: "Booking Date" },
                    { value: "roomType", label: "Room Type" },
                  ]}
                  style={{ width: "100px" }}
                  variant="unstyled"
                  size="sm"
                />
              </Group>
            </Group>
            <GuestRoomBookingCard
              roomType="Deluxe Suite"
              roomSize="40 sq m"
              checkInDate="2023-07-15"
              checkOutDate="2023-07-20"
              bookingDate="2023-05-01"
              paymentStatus="Paid"
              totalAmount="$1000"
              guestName="John Doe"
              leaveStatus="confirmed"
            />
            <br />
          </Stack>

          <Stack spacing="md">
            <Group position="apart" align="center">
              <Text weight={500} size="xl" color="dimmed">
                Past Bookings
              </Text>
              <Group spacing="xs">
                <Text size="sm" color="dimmed">
                  Sort By:
                </Text>
                <Select
                  placeholder="Date"
                  data={[
                    { value: "checkInDate", label: "Check-in Date" },
                    { value: "bookingDate", label: "Booking Date" },
                    { value: "roomType", label: "Room Type" },
                  ]}
                  style={{ width: "100px" }}
                  variant="unstyled"
                  size="sm"
                />
              </Group>
            </Group>

            <GuestRoomBookingCard
              roomType="Standard Room"
              roomSize="25 sq m"
              checkInDate="2023-04-10"
              checkOutDate="2023-04-15"
              bookingDate="2023-03-01"
              paymentStatus="Paid"
              totalAmount="$500"
              guestName="Jane Smith"
              leaveStatus="completed"
            />
            <GuestRoomBookingCard
              roomType="Family Suite"
              roomSize="60 sq m"
              checkInDate="2023-03-22"
              checkOutDate="2023-03-25"
              bookingDate="2023-02-15"
              paymentStatus="Paid"
              totalAmount="$900"
              guestName="Mike Johnson"
              leaveStatus="completed"
            />
            <GuestRoomBookingCard
              roomType="Executive Room"
              roomSize="35 sq m"
              checkInDate="2023-02-15"
              checkOutDate="2023-02-18"
              bookingDate="2023-01-20"
              paymentStatus="Refunded"
              totalAmount="$600"
              guestName="Sarah Brown"
              leaveStatus="cancelled"
            />
          </Stack>
          <br />
        </Stack>
      </ScrollArea>
    </Paper>
  );
}
