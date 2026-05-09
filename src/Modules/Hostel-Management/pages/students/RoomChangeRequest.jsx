import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Paper,
  Stack,
  Select,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { studentService } from "../../services";

export default function RoomChangeRequest() {
  const [formData, setFormData] = useState({
    currentRoom: "",
    preferredRoom: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const requestRef = useRef(0);

  const fetchRequests = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      const response = await studentService.getMyRoomChangeRequests();
      if (requestId !== requestRef.current) return;

      const data = Array.isArray(response.data?.requests)
        ? response.data.requests
        : Array.isArray(response.data)
          ? response.data
          : [];
      setRequests(data);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      setRequests([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoadingRequests(false);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchAvailableRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await studentService.getAvailableRoomsForStudent();
        if (!isMounted) return;
        const rooms = Array.isArray(response.data?.rooms)
          ? response.data.rooms
          : [];
        setAvailableRooms(rooms);
        setFormData((prev) =>
          rooms.length &&
          !rooms.some((room) => room.value === prev.preferredRoom)
            ? { ...prev, preferredRoom: "" }
            : prev,
        );
      } catch (error) {
        if (!isMounted) return;
        setAvailableRooms([]);
      } finally {
        if (isMounted) {
          setLoadingRooms(false);
        }
      }
    };

    fetchAvailableRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (
      !formData.currentRoom.trim() ||
      !formData.preferredRoom.trim() ||
      !formData.reason.trim()
    ) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await studentService.submitRoomChangeRequest({
        current_room: formData.currentRoom.trim(),
        preferred_room: formData.preferredRoom.trim(),
        reason: formData.reason.trim(),
      });

      const requestId = response.data?.request_id;
      setSuccessMessage(
        requestId
          ? `Room change request submitted successfully. Request ID: ${requestId}`
          : "Room change request submitted successfully.",
      );
      setFormData({ currentRoom: "", preferredRoom: "", reason: "" });
      fetchRequests();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to submit room change request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (statusValue) => {
    const normalized = String(statusValue || "").toLowerCase();
    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";
    return "Pending";
  };

  const pendingRequests = requests.filter(
    (request) => String(request.status || "").toLowerCase() === "pending",
  );
  const pastRequests = requests.filter((request) => {
    const status = String(request.status || "").toLowerCase();
    return status === "approved" || status === "rejected";
  });

  const visibleRequests =
    activeTab === "pending"
      ? pendingRequests
      : activeTab === "past"
        ? pastRequests
        : requests;

  return (
    <Paper shadow="xs" p="lg" radius="md" withBorder>
      <Stack spacing="md">
        <Text fw={600} size="lg">
          Room Change Request
        </Text>

        {successMessage && (
          <Alert icon={<IconCheck size={16} />} color="teal" title="Success">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <Box>
              <Text fw={500} mb={6}>
                Current Room
              </Text>
              <TextInput
                placeholder="Enter current room (e.g., A-101)"
                value={formData.currentRoom}
                onChange={(event) =>
                  handleChange("currentRoom", event.currentTarget.value)
                }
                required
              />
            </Box>

            <Box>
              <Text fw={500} mb={6}>
                Preferred Room
              </Text>
              <Select
                placeholder={
                  loadingRooms
                    ? "Loading available rooms..."
                    : availableRooms.length
                      ? "Select preferred room"
                      : "No vacant rooms available"
                }
                data={availableRooms}
                value={formData.preferredRoom}
                onChange={(value) => handleChange("preferredRoom", value || "")}
                searchable
                disabled={loadingRooms || availableRooms.length === 0}
                nothingFound="No rooms found"
                required
              />
            </Box>

            <Box>
              <Text fw={500} mb={6}>
                Reason
              </Text>
              <Textarea
                minRows={4}
                placeholder="Enter reason for requesting room change"
                value={formData.reason}
                onChange={(event) =>
                  handleChange("reason", event.currentTarget.value)
                }
                required
              />
            </Box>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit Request
            </Button>
          </Stack>
        </form>

        <Card withBorder radius="md" p="md">
          <Text fw={600} size="md" mb="sm">
            My Requests
          </Text>
          <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="sm">
            <Tabs.List grow>
              <Tabs.Tab value="all">All</Tabs.Tab>
              <Tabs.Tab value="pending">Pending</Tabs.Tab>
              <Tabs.Tab value="past">Past</Tabs.Tab>
            </Tabs.List>
          </Tabs>
          {loadingRequests ? (
            <Text color="dimmed" size="sm">
              Loading requests...
            </Text>
          ) : visibleRequests.length === 0 ? (
            <Text color="dimmed" size="sm">
              No room change requests yet.
            </Text>
          ) : (
            <Table striped highlightOnHover withBorder>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Current Room</th>
                  <th>Preferred Room</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.current_room}</td>
                    <td>{request.preferred_room}</td>
                    <td>{request.reason}</td>
                    <td>{renderStatus(request.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </Stack>
    </Paper>
  );
}
