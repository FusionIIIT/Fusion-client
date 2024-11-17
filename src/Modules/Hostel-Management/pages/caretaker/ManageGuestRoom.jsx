import React, { useState, useEffect } from "react";
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
  Container,
  Loader,
} from "@mantine/core";
import { CalendarBlank, Bed } from "@phosphor-icons/react";
import axios from "axios";
import {
  show_guestroom_booking_request,
  update_guest_room,
} from "../../../../routes/hostelManagementRoutes";

export default function ManageGuestRoomRequest() {
  const [guestRoomRequests, setGuestRoomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGuestRoomRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(show_guestroom_booking_request, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log(response.data);
      setGuestRoomRequests(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (e) {
      console.error("Error fetching guest room requests:", e);
      setError(
        e.response?.data?.message ||
          "Failed to fetch guest room requests. Please try again later.",
      );
      setGuestRoomRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestRoomRequests();
  }, []);

  const handleStatusUpdate = async (id, status, guestRoomId = "") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        update_guest_room,
        {
          booking_id: id,
          status,
          guest_room_id: guestRoomId,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.data.status === "notVacant") {
        alert("Guest Room not vacant.");
      }
      if (response.data.status === "success") {
        setGuestRoomRequests(
          guestRoomRequests.map((request) =>
            request.id === id ? { ...request, status } : request,
          ),
        );
      }
    } catch (e) {
      console.error("Error updating guest room status:", e);
      setError(
        e.response?.data?.message ||
          "Failed to update guest room status. Please try again later.",
      );
    }
  };

  const handleApprove = (id, guestRoomId) => {
    handleStatusUpdate(id, "accepted", guestRoomId);
  };

  const handleDecline = (id) => {
    handleStatusUpdate(id, "rejected");
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
        {loading ? (
          <Container
            py="xl"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Loader size="lg" />
          </Container>
        ) : error ? (
          <Text align="center" color="red" size="lg">
            {error}
          </Text>
        ) : guestRoomRequests.length > 0 ? (
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
                  align="stretch"
                  justify="space-between"
                  style={{ width: "100%", minHeight: "100px" }}
                >
                  <Group
                    spacing="md"
                    style={{ flex: "0 0 auto", marginRight: "1rem" }}
                  >
                    <Avatar color="blue" radius="xl" size="lg">
                      {request.guest_name[0]}
                    </Avatar>
                    <div>
                      <Text weight={500} size="sm" lineClamp={1}>
                        {request.guest_name}
                      </Text>
                      <Badge
                        size="sm"
                        variant="outline"
                        color="blue"
                        leftSection={<Bed size={12} />}
                      >
                        {request.room_type}
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
                        {request.purpose}
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
                          Check-in:
                        </Text>
                        <Text size="sm">{request.arrival_date}</Text>
                      </Group>
                      <Group spacing="xs">
                        <CalendarBlank size={16} />
                        <Text size="xs" color="dimmed">
                          Check-out:
                        </Text>
                        <Text size="sm">{request.departure_date}</Text>
                      </Group>
                    </div>
                    <Group spacing="xs" mt="auto">
                      {request.status === "pending" && (
                        <>
                          <Button
                            color="green"
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              handleApprove(request.id, request.guest_room_id)
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            color="red"
                            variant="outline"
                            size="xs"
                            onClick={() => handleDecline(request.id)}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {request.status !== "pending" && (
                        <Badge
                          color={
                            request.status === "accepted" ? "green" : "red"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </Badge>
                      )}
                    </Group>
                  </Flex>
                </Flex>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Text align="center" size="lg">
            No guest room requests found.
          </Text>
        )}
      </ScrollArea>
    </Paper>
  );
}
