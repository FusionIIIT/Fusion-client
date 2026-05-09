import React, { useState, useEffect } from "react";
import {
  Text,
  Group,
  Button,
  Stack,
  ScrollArea,
  Badge,
  Container,
  Loader,
  Card,
  Box,
  Divider,
  TextInput,
} from "@mantine/core";
import { caretakerService } from "../../services";

export default function ManageFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rollFilter, setRollFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");

  const fetchFines = async () => {
    try {
      const response = await caretakerService.getFines();
      setFines(Array.isArray(response.data?.fines) ? response.data.fines : []);
      console.log(fines);
      setError(null);
    } catch (err) {
      console.error("Error fetching fines:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch fines. Please try again later.",
      );
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!id) {
      console.error("Invalid fine ID:", id);
      setError("Invalid fine ID. Unable to update fine status.");
      return;
    }

    try {
      const response = await caretakerService.updateFineStatus(id, status);

      if (response.status === 200) {
        setFines((prevFines) =>
          prevFines.map((fine) =>
            fine.fine_id === id ? { ...fine, status } : fine,
          ),
        );
        setError(null);
      }
    } catch (err) {
      console.error("Error updating fine status:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update fine status. Please try again later.",
      );
    }
  };

  const handleMarkPaid = (id) => handleStatusUpdate(id, "Paid");

  const handleRemoveFine = async (id) => {
    if (!id) {
      setError("Invalid fine ID. Unable to remove fine.");
      return;
    }

    try {
      const response = await caretakerService.deleteFine(id);
      if (response.status === 204 || response.status === 200) {
        setFines((prevFines) =>
          prevFines.filter((fine) => fine.fine_id !== id),
        );
        setError(null);
      }
    } catch (err) {
      console.error("Error removing fine:", err);
      setError(
        err.response?.data?.error ||
          "Failed to remove fine. Please try again later.",
      );
    }
  };

  const filteredFines = fines.filter((fine) => {
    const rollText = rollFilter.trim().toLowerCase();
    const reasonText = reasonFilter.trim().toLowerCase();

    const matchesRoll = rollText
      ? String(fine.student_id || "")
          .toLowerCase()
          .includes(rollText)
      : true;

    const matchesReason = reasonText
      ? String(fine.reason || "")
          .toLowerCase()
          .includes(reasonText)
      : true;

    return matchesRoll && matchesReason;
  });

  const activeFines = filteredFines.filter((fine) => fine.status !== "Paid");

  const renderFineCard = (fine) => (
    <Card
      key={fine.fine_id}
      p="md"
      withBorder
      radius="sm"
      sx={(theme) => ({
        borderColor: theme.colors.gray[3],
      })}
    >
      <Group position="apart" mb="sm">
        <Group>
          <Text weight={500}>{fine.student_id}</Text>
          <Badge
            size="sm"
            variant="light"
            color={fine.status === "Paid" ? "green" : "orange"}
          >
            {fine.status}
          </Badge>
        </Group>
        <Text weight={600} color={fine.status === "Pending" ? "red" : "dark"}>
          ₹{fine.amount}
        </Text>
      </Group>

      <Text size="sm" color="dimmed" mb="md">
        {fine.reason || "No reason specified"}
      </Text>

      <Divider my="sm" />

      <Group position="right" mt="sm">
        <Button
          color="green"
          variant="light"
          size="sm"
          onClick={() => handleMarkPaid(fine.fine_id)}
        >
          Mark as Paid
        </Button>
        <Button
          color="red"
          variant="light"
          size="sm"
          onClick={() => handleRemoveFine(fine.fine_id)}
        >
          Remove Fine
        </Button>
      </Group>
    </Card>
  );

  return (
    <Container size="lg" px="md">
      <Card shadow="sm" p={0} radius="md" withBorder>
        <Box
          py="md"
          px="lg"
          sx={(theme) => ({
            backgroundColor: theme.colors.gray[0],
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            display: "flex",
            gap: theme.spacing.md,
            flexWrap: "wrap",
          })}
        >
          <TextInput
            placeholder="Filter by roll no"
            value={rollFilter}
            onChange={(event) => setRollFilter(event.currentTarget.value)}
          />
          <TextInput
            placeholder="Filter by reason"
            value={reasonFilter}
            onChange={(event) => setReasonFilter(event.currentTarget.value)}
          />
        </Box>
        <Box p="lg" sx={{ height: "70vh" }}>
          <ScrollArea style={{ height: "100%" }}>
            {loading ? (
              <Group position="center" style={{ height: "100%" }}>
                <Loader size="lg" />
              </Group>
            ) : error ? (
              <Text align="center" color="red" mt="xl">
                {error}
              </Text>
            ) : activeFines.length === 0 ? (
              <Text align="center" color="dimmed" mt="xl">
                No pending fines.
              </Text>
            ) : (
              <Stack spacing="md">
                <Text weight={600}>Manage Imposed Fines</Text>
                {activeFines.map(renderFineCard)}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Card>
    </Container>
  );
}
