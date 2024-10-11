import React from "react";
import {
  Box,
  Text,
  TextInput,
  Group,
  Stack,
  Badge,
} from "@mantine/core";

const defaultProps = {
  type: "Type",
  appliedOn: "",
  duration: "",
  relevantDetails: "",
  status: "Pending",
};

export default function LeaveApplicationCard(props = defaultProps) {
  const { type, appliedOn, duration, relevantDetails, status } = {
    ...defaultProps,
    ...props,
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'yellow';
    }
  };

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        backgroundColor: theme.white,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: "100%",
      })}
    >
      <Stack spacing="md">
        <Group position="apart" align="center" noWrap>
          <Text weight={600} size="lg">{type}</Text>
          <Badge 
            color={getStatusColor(status)} 
            variant="filled" 
            size="lg"
            style={{ minWidth: '100px', textAlign: 'center' }}
          >
           {status.toUpperCase()}
          </Badge>
        </Group>
        
        <Group grow align="flex-start" noWrap spacing="md">
          <TextInput
            label="Applied on"
            placeholder="Date"
            value={appliedOn}
            size="sm"
          />
          <TextInput
            label="Duration"
            placeholder="Number of days"
            value={duration}
            size="sm"
          />
          <TextInput
            label="Relevant Details"
            placeholder="Enter details"
            value={relevantDetails}
            size="sm"
          />
        </Group>
      </Stack>
    </Box>
  );
}

LeaveApplicationCard.defaultProps = defaultProps;