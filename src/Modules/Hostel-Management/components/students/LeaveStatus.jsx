import React from "react";
import { Box, Paper, Group, Text, Stack, Select, ScrollArea } from "@mantine/core";
import LeaveApplicationCard from "./LeaveApplicationCard"; // Assuming LeaveApplicationCard is in the same directory

export default function LeaveStatus() {
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
      <ScrollArea style={{ flex: 1 }}>
      <Text 
          align="left" 
          mb="xl" 
          size="24px" 
          style={{ color: '#757575', fontWeight: 'bold' }}
        >
          Leave Status
        </Text>
        <Stack spacing="xl">
          <Stack spacing="md">
            <Group position="apart" align="center">
              <Text weight={500} size="xl" color="dimmed">Active Leave Requests</Text>
              <Group spacing="xs">
                <Text size="sm" color="dimmed">
                  Sort By:
                </Text>
                <Select
                  placeholder="Date"
                  data={[{ value: "date", label: "Date" }]}
                  style={{ width: "100px" }}
                  variant="unstyled"
                  size="sm"
                />
              </Group>
            </Group>
            <LeaveApplicationCard
              type="Leave_type"
              appliedOn="2023-05-15"
              duration="3 days"
              relevantDetails="Annual leave for family vacations"
              status="Pending"
            />
             <br/>
          </Stack>

          <Stack spacing="md">
            <Group position="apart" align="center">
              <Text weight={500} size="xl" color="dimmed">Past Leave Requests</Text>
              <Group spacing="xs">
                <Text size="sm" color="dimmed">
                  Sort By:
                </Text>
                <Select
                  placeholder="Date"
                  data={[{ value: "date", label: "Date" }]}
                  style={{ width: "100px" }}
                  variant="unstyled"
                  size="sm"
                />
              </Group>
            </Group>

            <LeaveApplicationCard
              type="Leave_type"
              appliedOn="2023-04-10"
              duration="2 days"
              relevantDetails="Personal development workshop"
              status="Approved"
            />
            <LeaveApplicationCard
              type="Leave_type"
              appliedOn="2023-03-22"
              duration="1 day"
              relevantDetails="Medical appointment"
              status="Approved"
            />
          </Stack>
           <br/>
        </Stack>
      </ScrollArea>
    </Paper>
  );
}