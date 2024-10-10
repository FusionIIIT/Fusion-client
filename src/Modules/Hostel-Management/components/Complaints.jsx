import React from "react";
import { Box, Button, Group, Text, Stack, Select } from "@mantine/core";
import ComplaintCard from "./ComplaintCard"; // Assuming ComplaintCard is in the same directory

export default function Complaints() {
  return (
    <Box
      p="md"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Header with title and button */}
      <Group position="apart" style={{ width: "100%" }} mb="md">
        <Text size="xl" weight={700}>
          Complaints
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
