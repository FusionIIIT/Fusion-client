import React, { useEffect, useState, useCallback } from "react";
import { Card, Button, Group, Modal, Text, Loader, Alert } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { courseLabel } from "../../lib/course";
import SlotCard from "./components/SlotCard";
import SlotRow from "./components/SlotRow";

import {
  studentDropRegistrationsRoute,
  studentDropCourseRoute,
} from "../../routes/academicRoutes";

export default function StudentDropCourse() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dropping, setDropping] = useState(false);

  // Fetch current registrations
  const fetchRegistrations = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(studentDropRegistrationsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setRegs(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      setError(errorMsg || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const openModal = useCallback((reg) => setSelected(reg), []);
  const closeModal = useCallback(() => setSelected(null), []);

  const handleDrop = useCallback(async () => {
    if (!selected) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({
        title: "Authentication Error",
        message: "Please login again",
        color: "red",
      });
      return;
    }

    setDropping(true);
    try {
      const response = await axios.post(
        studentDropCourseRoute,
        { registration_id: selected.id },
        { headers: { Authorization: `Token ${token}` } },
      );

      showNotification({
        title: "Drop Request Submitted",
        message:
          response.data.message ||
          "Your drop request is pending Academic approval.",
        color: "blue",
      });

      // Remove from list optimistically
      setRegs((prev) => prev.filter((r) => r.id !== selected.id));
      closeModal();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;
      showNotification({
        title: "Drop Request Failed",
        message: errorMsg || "Failed to submit drop request",
        color: "red",
      });
    } finally {
      setDropping(false);
    }
  }, [selected, closeModal]);

  if (loading) return <Loader size="lg" />;
  if (error)
    return (
      <Alert color="red" title="Error">
        {error}
      </Alert>
    );
  if (!regs.length) {
    return (
      <Card withBorder p="md">
        <Alert color="gray">No courses available to drop.</Alert>
      </Card>
    );
  }

  return (
    <Card withBorder p="md">
      {regs.map((r) => (
        <SlotCard
          key={r.id}
          name={r.slot}
          meta={[r.academic_year, r.semester_type].filter(Boolean).join(" · ")}
        >
          <SlotRow
            primary={courseLabel({ code: r.course, name: r.course_name })}
            secondary="Registered course"
            control={
              <Button
                variant="light"
                color="red"
                size="xs"
                onClick={() => openModal(r)}
                disabled={dropping}
              >
                Request Drop
              </Button>
            }
          />
        </SlotCard>
      ))}

      <Modal
        opened={!!selected}
        onClose={closeModal}
        title="Confirm Drop Request"
        closeOnClickOutside={!dropping}
        closeOnEscape={!dropping}
      >
        <Text mb="md">
          Submit a drop request for <strong>{selected?.course}</strong>
          {selected?.course_name && (
            <Text size="sm" c="dimmed">
              ({selected.course_name})
            </Text>
          )}
          ?
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={closeModal} disabled={dropping}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDrop} loading={dropping}>
            Submit Request
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
