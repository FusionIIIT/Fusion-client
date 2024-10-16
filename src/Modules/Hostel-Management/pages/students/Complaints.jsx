import React from "react";
import { Box, Paper, Button, Group, Text, Stack, Select, ScrollArea } from "@mantine/core";
import ComplaintCard from "../../components/students/ComplaintCard"; // Assuming ComplaintCard is in the same directory

export default function Complaints() {
  return (
    <Paper
      shadow="md"
      p="md"
      withBorder
      sx={(theme) => ({
        position: 'fixed',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.white,
        border: `1px solid ${theme.colors.gray[3]}`,
        borderRadius: theme.radius.md,
      })}
    >
      <Group position="apart" style={{ width: "100%" }} mb="xl">
        <Text 
          align="left" 
          size="24px" 
          style={{ color: '#757575', fontWeight: 'bold' }}
        >
          Register Complaints
        </Text>
        <div style={{ marginLeft: "auto" }}>
          <Button size="xl">Make Complaint</Button>
        </div>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        <Stack spacing="md">
          <Group position="apart" align="center">
            <Text weight={500} size="xl" color="dimmed">Active Complaints</Text>
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
            <Text weight={500} size="xl" color="dimmed">Past Complaints</Text>
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
    </Paper>
  );
}
