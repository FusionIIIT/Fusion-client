import React from "react";
import { Paper, Text, Group, Badge, Divider, Button } from "@mantine/core";

const defaultProps = {
  fine_id: "",
  fineId: "",
  student_name: "Unknown",
  studentName: "Unknown",
  hall: "Unknown Hall",
  amount: 0,
  status: "Pending",
  reason: "No reason provided",
};

export default function FineCard(props = defaultProps) {
  const normalizeStatus = (value) => {
    const upper = String(value || "")
      .trim()
      .toUpperCase();
    if (!upper) return "Unpaid";
    if (upper === "PAID") return "Paid";
    if (upper === "UNPAID") return "Unpaid";
    if (upper === "PENDING") return "Unpaid";
    return upper.charAt(0) + upper.slice(1).toLowerCase();
  };

  const getStatusColor = (displayStatus) => {
    switch (String(displayStatus || "").toLowerCase()) {
      case "paid":
        return "green";
      case "unpaid":
        return "orange";
      default:
        return "gray";
    }
  };

  const merged = { ...defaultProps, ...props };
  const fineId = merged.fineId || merged.fine_id;
  const studentName = merged.studentName || merged.student_name;
  const displayStatus = normalizeStatus(merged.status);
  const isUnpaid = String(displayStatus).toLowerCase() === "unpaid";

  return (
    <Paper
      radius="sm"
      withBorder
      p="md"
      sx={(theme) => ({
        backgroundColor: theme.white,
        borderColor: theme.colors.gray[3],
      })}
    >
      <Group position="apart" mb="md">
        <Group spacing="xs">
          <Text weight={600} size="lg" color={isUnpaid ? "red" : "dark"}>
            ₹{Number(merged.amount || 0).toLocaleString()}
          </Text>
        </Group>
        <Badge color={getStatusColor(displayStatus)} size="md" variant="light">
          {displayStatus}
        </Badge>
      </Group>

      {(studentName || merged.hall) && (
        <Group grow mb="sm">
          {studentName && (
            <div>
              <Text size="xs" color="dimmed">
                Student
              </Text>
              <Text size="sm">{studentName}</Text>
            </div>
          )}
          {merged.hall && (
            <div>
              <Text size="xs" color="dimmed">
                Hall
              </Text>
              <Text size="sm">{merged.hall}</Text>
            </div>
          )}
        </Group>
      )}

      <Divider my="xs" />

      <div>
        <Text size="xs" color="dimmed" mb="xs">
          Reason
        </Text>
        <Text size="sm">{merged.reason}</Text>
      </div>

      {isUnpaid && typeof merged.onPay === "function" && (
        <Group justify="flex-end" mt="md">
          <Button size="xs" onClick={() => merged.onPay(fineId)}>
            Pay
          </Button>
        </Group>
      )}
    </Paper>
  );
}

FineCard.defaultProps = defaultProps;
