import React from "react";
import {
  Box,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
} from "@mantine/core";

const defaultProps = {
  amount: 0,
  hall: "Hall-id",
  details: "",
  reason: "",
  isPastFine: false,
};

export default function FineCard(props = defaultProps) {
  const { amount, hall, details, reason, isPastFine } = {
    ...defaultProps,
    ...props,
  };

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.white,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "800px",
      })}
    >
      <Stack spacing="sm">
        <Group position="apart" align="center">
          <Text
            weight={700}
            size="xl"
            color="red"
            style={{ minWidth: "100px" }}
          >
            ₹{amount.toLocaleString()}
          </Text>
          <Group grow style={{ flex: 1 }}>
            <TextInput placeholder="Hall" value={hall} size="md" />
            <TextInput placeholder="Reason" value={details} size="md" />
          </Group>
          <Textarea
            placeholder="Details"
            value={reason}
            size="md"
            style={{ flex: 1, minWidth: "200px" }}
          />
          <Button
            variant="filled"
            color={isPastFine ? "green" : "dark"}
            size="md"
          >
            {isPastFine ? "Paid" : "Upload Document"}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

FineCard.default = defaultProps;
