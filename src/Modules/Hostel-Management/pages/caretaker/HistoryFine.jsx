import React, { useEffect, useState } from "react";
import {
  Text,
  Group,
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

export default function HistoryFine() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rollFilter, setRollFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");

  const fetchFines = async () => {
    try {
      const response = await caretakerService.getFines();
      setFines(Array.isArray(response.data?.fines) ? response.data.fines : []);
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

  const filteredFines = fines.filter((fine) => {
    if (fine.status !== "Paid") {
      return false;
    }

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
            ) : filteredFines.length === 0 ? (
              <Text align="center" color="dimmed" mt="xl">
                No paid fines.
              </Text>
            ) : (
              <Stack spacing="md">
                <Text weight={600}>History</Text>
                {filteredFines.map((fine) => (
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
                        <Badge size="sm" variant="light" color="green">
                          {fine.status}
                        </Badge>
                      </Group>
                      <Text weight={600} color="dark">
                        ₹{fine.amount}
                      </Text>
                    </Group>

                    <Text size="sm" color="dimmed" mb="md">
                      {fine.reason || "No reason specified"}
                    </Text>

                    <Divider my="sm" />
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Box>
      </Card>
    </Container>
  );
}
