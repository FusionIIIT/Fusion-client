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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'green';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Box
      sx={(theme) => ({
        border: `2px solid ${theme.colors.dark[9]}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        backgroundColor: theme.white,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "600px",
      })}
    >
      <Stack spacing="md">
        <Group position="apart" align="center">
          <Text weight={700} size="lg">
            {label || "No Label"}
          </Text>
          <Badge 
            color={getStatusColor(status)} 
            variant="filled" 
            size="lg"
            style={{ minWidth: '100px', textAlign: 'center' }}
          >
            {status}
          </Badge>
        </Group>
        <Group grow>
          <TextInput 
            label="Date"
            placeholder="Enter date" 
            value={date} 
            size="md" 
          />
          <TextInput 
            label="Location"
            placeholder="Enter location" 
            value={location} 
            size="md" 
          />
        </Group>
        <Textarea
          label="Description"
          placeholder="Enter description"
          value={description}
          size="md"
          minRows={3}
        />
      </Stack>
    </Box>
  );
}

ComplaintCard.defaultProps = defaultProps;