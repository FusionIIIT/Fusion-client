/**
 * ViewBookingModal
 * Modal component for viewing booking details with print functionality
 * 
 * Features:
 * - Display all booking details
 * - Show room assignments
 * - Print booking confirmation
 * - Status indicators
 */

import React from "react";
import {
  Modal,
  Grid,
  Text,
  Badge,
  Button,
  Group,
  Divider,
  Stack,
  Paper,
  Alert,
} from "@mantine/core";
import { IconPrinter, IconCalendar, IconHome, IconUser } from "@tabler/icons-react";

const STATUS_COLORS = {
  Pending: "yellow",
  Forward: "indigo",
  Confirmed: "blue",
  CheckedIn: "green",
  Complete: "gray",
  Canceled: "red",
  Rejected: "red",
};

function ViewBookingModal({ opened, onClose, bookingData }) {
  const primaryVisitor = bookingData?.visitors?.[0] || {};
  const assignedRooms = bookingData?.rooms || [];

  if (!bookingData) {
    return (
      <Modal opened={opened} onClose={onClose} title="Booking Details" size="lg">
        <Alert type="info">No booking data available</Alert>
      </Modal>
    );
  }

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="text-align: center; color: #228be6;">Visitor Hostel Booking Confirmation</h2>
        <hr/>
        
        <h3>Booking Details</h3>
        <p><strong>Booking ID:</strong> ${bookingData.id}</p>
        <p><strong>Status:</strong> ${bookingData.status || "N/A"}</p>
        <p><strong>Booking Date:</strong> ${bookingData.created_at ? new Date(bookingData.created_at).toLocaleDateString() : "N/A"}</p>
        
        <h3>Guest Information</h3>
        <p><strong>Name:</strong> ${bookingData.intender_name || "N/A"}</p>
        <p><strong>Email:</strong> ${primaryVisitor.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${primaryVisitor.phone || "N/A"}</p>
        <p><strong>Organization:</strong> ${primaryVisitor.organization || "N/A"}</p>
        <p><strong>Address:</strong> ${primaryVisitor.address || "N/A"}</p>
        
        <h3>Stay Details</h3>
        <p><strong>Check-In:</strong> ${bookingData.booking_from || "N/A"}</p>
        <p><strong>Check-Out:</strong> ${bookingData.booking_to || "N/A"}</p>
        <p><strong>Room Category:</strong> ${bookingData.visitor_category || "N/A"}</p>
        <p><strong>Number of Rooms:</strong> ${bookingData.number_of_rooms || "N/A"}</p>
        <p><strong>Number of Persons:</strong> ${bookingData.person_count || "N/A"}</p>
        
        ${bookingData.purpose_of_visit ? `<h3>Purpose</h3><p>${bookingData.purpose_of_visit}</p>` : ""}
        
        ${assignedRooms.length > 0 ? `
          <h3>Room Assignments</h3>
          <p>${assignedRooms.map((room) => room.room_number).join(", ")}</p>
        ` : ""}
        
        <hr/>
        <p style="text-align: center; font-size: 12px; color: #666;">
          Printed on: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Booking Details" size="lg" centered>
      <Stack spacing="md">
        {/* Header with Status */}
        <Paper p="md" style={{ backgroundColor: "#f1f3f5", borderRadius: "4px" }}>
          <Group position="apart" mb="sm">
            <div>
              <Text fw={700} size="lg">
                Booking #{bookingData.id}
              </Text>
              <Text size="sm" color="dimmed">
                {bookingData.intender_name || "Guest"}
              </Text>
            </div>
            <Badge
              size="lg"
              color={STATUS_COLORS[bookingData.status] || "gray"}
              variant="filled"
            >
              {bookingData.status?.toUpperCase() || "UNKNOWN"}
            </Badge>
          </Group>
          <Text size="xs" color="dimmed">
            Posted: {bookingData.created_at ? new Date(bookingData.created_at).toLocaleDateString() : "N/A"}
          </Text>
        </Paper>

        <Divider />

        {/* Guest Information */}
        <div>
          <Group mb="sm">
            <IconUser size={18} />
            <Text fw={600}>Guest Information</Text>
          </Group>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Name
              </Text>
              <Text fw={500}>{bookingData.intender_name || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Email
              </Text>
              <Text fw={500}>{primaryVisitor.email || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Phone
              </Text>
              <Text fw={500}>{primaryVisitor.phone || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Organization
              </Text>
              <Text fw={500}>{primaryVisitor.organization || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text size="sm" color="dimmed">
                Address
              </Text>
              <Text fw={500}>{primaryVisitor.address || "N/A"}</Text>
            </Grid.Col>
          </Grid>
        </div>

        <Divider />

        {/* Stay Details */}
        <div>
          <Group mb="sm">
            <IconHome size={18} />
            <Text fw={600}>Stay Details</Text>
          </Group>
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Check-In
              </Text>
              <Text fw={500}>{bookingData.booking_from || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Check-Out
              </Text>
              <Text fw={500}>{bookingData.booking_to || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Room Category
              </Text>
              <Text fw={500}>{bookingData.visitor_category || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Number of Rooms
              </Text>
              <Text fw={500}>{bookingData.number_of_rooms || "N/A"}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" color="dimmed">
                Number of Persons
              </Text>
              <Text fw={500}>{bookingData.person_count || "N/A"}</Text>
            </Grid.Col>
          </Grid>
        </div>

        {/* Room Assignments */}
        {assignedRooms.length > 0 && (
          <>
            <Divider />
            <div>
              <Text fw={600} mb="sm">
                Assigned Rooms
              </Text>
              <Group>
                {assignedRooms.map((room, idx) => (
                  <Badge key={idx} variant="light" color="blue">
                    {room.room_number}
                  </Badge>
                ))}
              </Group>
            </div>
          </>
        )}

        {/* Purpose */}
        {bookingData.purpose_of_visit && (
          <>
            <Divider />
            <div>
              <Text fw={600} size="sm" mb="xs">
                Purpose of Visit
              </Text>
              <Text size="sm">{bookingData.purpose_of_visit}</Text>
            </div>
          </>
        )}

        {/* Actions */}
        <Group position="right" mt="xl">
          <Button
            leftIcon={<IconPrinter size={16} />}
            variant="default"
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ViewBookingModal;

