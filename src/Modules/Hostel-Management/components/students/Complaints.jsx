import React from "react";
import { Box, Button, Group, Text, Stack, Select, ScrollArea } from "@mantine/core";
import ComplaintCard from "./ComplaintCard"; // Assuming ComplaintCard is in the same directory

export default function Complaints() {
  return (
    <Box
      p="xl"
      style={(theme) => ({
        width: '100%',
        margin: "0 auto",
        height: "78vh",
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Group position="apart" style={{ width: "100%" }} mb="lg">
        <Text 
          align="left" 
          mb="xl" 
          size="24px" 
          style={{ color: '#757575', fontWeight: 'bold' }}
        >
          Register Complaints
        </Text>
        <div style={{ marginLeft: "auto" }}>
          <Button size="lg">Make Complaint</Button>
        </div>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        <Stack spacing="md">
          <Group position="apart" align="center">
            <Text weight={500} size="xl">Active Complaints</Text>
            <Group spacing="xs">
              <Text size="lg" color="dimmed">
                Sort By:
              </Text>
              <Select
                placeholder="Date"
                data={[{ value: "date", label: "Date" }]}
                style={{ width: "100px" }}
                variant="unstyled"
                size="lg"
              />
            </Group>
          </Group>
          
          <ComplaintCard
            label="Label"
            date="Date"
            location="Location"
            description="Description"
            status="Pending"
          />

          <Group position="apart" align="center" mt="lg">
            <Text weight={500} size="xl">Past Complaints</Text>
            <Group spacing="xs">
              <Text size="lg" color="dimmed">
                Sort By:
              </Text>
              <Select
                placeholder="Date"
                data={[{ value: "date", label: "Date" }]}
                style={{ width: "100px" }}
                variant="unstyled"
                size="lg"
              />
            </Group>
          </Group>

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
      </ScrollArea>
    </Box>
  );
}