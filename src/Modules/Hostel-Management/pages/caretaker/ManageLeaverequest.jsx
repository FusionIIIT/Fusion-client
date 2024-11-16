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
import { CalendarBlank } from "@phosphor-icons/react";
import axios from "axios";
import {
  show_leave_request,
  update_leave_status,
} from "../../../../routes/hostelManagementRoutes";

export default function ManageLeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaveRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(show_leave_request, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log(response.data);
      setLeaveRequests(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (e) {
      console.error("Error fetching leave requests:", e);
      setError(
        e.response?.data?.message ||
          "Failed to fetch leave requests. Please try again later.",
      );
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleStatusUpdate = async (id, status, remark = "") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    try {
      const response = await axios.post(
        update_leave_status,
        {
          leave_id: id,
          status,
          remark,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.data.status === "success") {
        setLeaveRequests(
          leaveRequests.map((request) =>
            request.id === id ? { ...request, status, remark } : request,
          ),
        );
      }
    } catch (e) {
      console.error("Error updating leave status:", e);
      setError(
        e.response?.data?.message ||
          "Failed to update leave status. Please try again later.",
      );
    }
  };

  const handleAccept = (id) => {
    handleStatusUpdate(id, "approved");
  };

  const handleReject = (id) => {
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
        Manage Leave Request
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
        ) : Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
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
                      {request.student_name[0]}
                    </Avatar>
                    <div>
                      <Text weight={500} size="sm" lineClamp={1}>
                        {request.student_name}
                      </Text>
                      <Badge size="sm" variant="outline" color="blue">
                        {request.roll_num}
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
                        <Text size="sm">{request.start_date}</Text>
                      </Group>
                      <Group spacing="xs">
                        <CalendarBlank size={16} />
                        <Text size="xs" color="dimmed">
                          To:
                        </Text>
                        <Text size="sm">{request.end_date}</Text>
                      </Group>
                    </div>
                    <Group spacing="xs" mt="auto">
                      {request.status === "pending" && (
                        <>
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
                        </>
                      )}
                      {request.status !== "pending" && (
                        <Badge
                          color={
                            request.status === "approved" ? "green" : "red"
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
            No leave requests found.
          </Text>
        )}
      </ScrollArea>
    </Paper>
  );
}
