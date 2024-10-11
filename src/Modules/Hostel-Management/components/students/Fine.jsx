import React from "react";
import { Box, Paper, Button, Group, Text, Stack, Select, ScrollArea } from "@mantine/core";
import FineCard from "./FineCard"; // Assuming FineCard is in the same directory

export default function Fines() {
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
      <Group position="apart" style={{ width: "100%" }} mb="lg">
        <Text 
          align="left" 
          mb="xl" 
          size="24px" 
          style={{ color: '#757575', fontWeight: 'bold' }}
        >
          My Fines
        </Text>
      </Group>

      <ScrollArea style={{ flex: 1 }}>
        <Stack spacing="md">
          <Group position="apart" align="center">
            <Text weight={500} size="xl">Active Fines</Text>
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
          
          <FineCard
            amount={5000}
            hall="Hall-1"
            details="Details"
            reason="Reason"
          />

          <Group position="apart" align="center" mt="lg">
            <Text weight={500} size="xl">Past Fines' History</Text>
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

          <FineCard
            amount={2000}
            hall="Hall-1"
            details="Details"
            reason="Reason"
            isPastFine={true}
          />
          <FineCard
            amount={500}
            hall="Hall-3"
            details="Details"
            reason="Reason"
            isPastFine={true}
          />
        </Stack>
      </ScrollArea>
    </Paper>
  );
}