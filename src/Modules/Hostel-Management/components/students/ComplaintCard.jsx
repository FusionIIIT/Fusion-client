import React from "react";
import {
  Box,
  Text,
  TextInput,
  Textarea,
  Badge,
  Group,
  Stack,
} from "@mantine/core";

const defaultProps = {
  label: "Default Label",
  date: "",
  location: "",
  description: "",
  status: "Pending",
};

export default function ComplaintCard(props) {
  const { label, date, location, description, status } = {
    ...defaultProps,
    ...props,
  };

  console.log("ComplaintCard props:", {
    label,
    date,
    location,
    description,
    status,
  });

  return (
    <Box
      sx={(theme) => ({
        border: `2px solid ${theme.colors.dark[9]}`,
        borderRadius: theme.radius.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.white,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "600px",
      })}
    >
      <Stack spacing="sm">
        <Group position="apart" align="center">
          <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
            <Text weight={700} size="lg" style={{ marginRight: "10px" }}>
              {label || "No Label"}
            </Text>
            {status === "Pending" ? (
              <Badge color="red" variant="filled" size="md">
                Status: {status}
              </Badge>
            ) : (
              <Badge color="green" variant="filled" size="md">
                Status: {status}
              </Badge>
            )}
          </div>
        </Group>

        <Group grow>
          <TextInput placeholder="Date" value={date} size="md" />
          <TextInput placeholder="Location" value={location} size="md" />
        </Group>

        <Textarea
          placeholder="Description"
          value={description}
          size="md"
          minRows={3}
        />
      </Stack>
    </Box>
  );
}

ComplaintCard.defaultProps = defaultProps;