import React from "react";
import { Box, Button, Group, Text, Stack, Select } from "@mantine/core";
import ComplaintCard from "./ComplaintCard"; // Assuming ComplaintCard is in the same directory

export default function Complaints() {
  return (
    <Box
      p="md"
      style={(theme) => ({
        width: '100%',
        margin: "0 auto",
        height: "78vh",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      {/* Header with title and button */}
      <Group position="apart" style={{ width: "100%" }} mb="md">
        <Text 
          align="left" 
          mb="xl" 
          size="xl" 
          style={{ color: '#757575', weight: 'bold' }} // Gray color
        >
          Register Complaints
        </Text>
        {/* Use flexbox to push the button to the right */}
        <div style={{ marginLeft: "auto" }}>
          <Button color="dark">Make Complaint</Button>
        </div>
      </Group>

      <Stack spacing="xs">
        {/* Active Complaints Section */}
        <Group position="apart" align="center">
          <Text weight={500}>Active Complaints</Text>
          <Group spacing="xs">
            <Text size="sm" color="dimmed">
              Sort By:
            </Text>
            <Select
              placeholder="Date"
              data={[{ value: "date", label: "Date" }]} // Sample data, add more options as needed
              style={{ width: "80px" }}
              variant="unstyled"
            />
          </Group>
        </Group>

        {/* Sample Complaint Card for Active Complaints */}
        <ComplaintCard
          label="Label"
          date="Date"
          location="Location"
          description="Description"
          status="Pending"
        />

        {/* Past Complaints Section */}
        <Group position="apart" align="center" mt="md">
          <Text weight={500}>Past Complaints</Text>
          <Group spacing="xs">
            <Text size="sm" color="dimmed">
              Sort By:
            </Text>
            <Select
              placeholder="Date"
              data={[{ value: "date", label: "Date" }]} // Sample data, add more options as needed
              style={{ width: "80px" }}
              variant="unstyled"
            />
          </Group>
        </Group>

        {/* Sample Complaint Cards for Past Complaints */}
        <ComplaintCard
          label="Label"
          date="Date"
          location="Location"
          description="Description"
          status="Resolved"
        />
        <ComplaintCard
          label="Label"
          date="Date"
          location="Location"
          description="Description"
          status="Resolved"
        />
      </Stack>
    </Box>
  );
}
