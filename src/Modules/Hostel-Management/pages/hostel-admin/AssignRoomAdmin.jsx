import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { adminService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function AssignRoomAdmin() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const requestRef = useRef(0);

  const fetchRoomAllocationData = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    try {
      setLoading(true);
      setError("");
      const response = await adminService.getRoomAllocationData();
      if (requestId !== requestRef.current) return;

      setStudents(
        Array.isArray(response.data?.students) ? response.data.students : [],
      );
      setRooms(
        Array.isArray(response.data?.available_rooms)
          ? response.data.available_rooms
          : [],
      );
    } catch (fetchError) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          fetchError,
          "Failed to load students and available rooms.",
        ),
      );
      setStudents([]);
      setRooms([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRoomAllocationData();
  }, []);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.student_id,
        label: `${student.student_id} - ${student.name}`,
      })),
    [students],
  );

  const roomOptions = useMemo(
    () =>
      rooms.map((room) => ({
        value: String(room.room_id),
        label: `${room.hall_name} | Block ${room.block_no} | Room ${room.room_no} (${room.available_slots} slot(s) left)`,
      })),
    [rooms],
  );

  const handleAssign = async () => {
    setError("");
    setSuccess("");

    if (!selectedStudent || !selectedRoom) {
      setError("Please select both a student and an available room.");
      return;
    }

    try {
      setAssigning(true);
      const response = await adminService.assignRoomToStudent({
        student_id: selectedStudent,
        room_id: Number(selectedRoom),
      });

      setSuccess(response.data?.message || "Room assigned successfully.");
      setSelectedStudent(null);
      setSelectedRoom(null);

      // Refresh to immediately remove consumed slots and keep availability accurate.
      await fetchRoomAllocationData();
    } catch (assignError) {
      setError(
        getApiErrorMessage(
          assignError,
          "Failed to assign room. Please try again.",
        ),
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card shadow="xs" radius="md" withBorder p="lg">
      <Stack spacing="md">
        <Text fw={600} size="lg">
          Room Allocation
        </Text>

        {success && (
          <Alert icon={<IconCheck size={16} />} color="teal" title="Success">
            {success}
          </Alert>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        <Select
          label="Select Student"
          placeholder={loading ? "Loading students..." : "Choose student"}
          data={studentOptions}
          value={selectedStudent}
          onChange={setSelectedStudent}
          searchable
          disabled={loading || assigning}
          nothingFoundMessage="No students found"
        />

        <Select
          label="Select Available Room"
          placeholder={loading ? "Loading available rooms..." : "Choose room"}
          data={roomOptions}
          value={selectedRoom}
          onChange={setSelectedRoom}
          searchable
          disabled={loading || assigning}
          nothingFoundMessage="No available rooms"
        />

        <Group justify="space-between" mt="sm">
          <Button
            variant="light"
            onClick={fetchRoomAllocationData}
            disabled={loading || assigning}
          >
            Refresh Availability
          </Button>
          <Button
            onClick={handleAssign}
            loading={assigning}
            disabled={loading || assigning}
          >
            Assign Room
          </Button>
        </Group>

        <Box>
          <Text size="sm" c="dimmed">
            Only rooms with available slots are listed. Allocation is validated
            on the server to prevent double booking.
          </Text>
        </Box>
      </Stack>
    </Card>
  );
}
