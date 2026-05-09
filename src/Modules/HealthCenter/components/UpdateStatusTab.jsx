import React from 'react';
import { Card, Stack, Select, Button, Title, Text, SimpleGrid, Group, Badge } from '@mantine/core';

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ON_BREAK', label: 'On Break' },
  { value: 'DEPARTED', label: 'Departed' },
];

export default function UpdateStatusTab({
  attendanceForm,
  setAttendanceForm,
  doctors,
  todaysSchedule,
  onUpdateAttendance,
  loading,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green';
      case 'ON_BREAK':
        return 'yellow';
      default:
        return 'red';
    }
  };

  return (
    <Stack gap="md">
      <Card withBorder p="lg">
        <Stack gap="md">
          <div>
            <Title order={4}>Update Doctor Status</Title>
            <Text size="sm" color="dimmed">
              Mark doctor attendance for today
            </Text>
          </div>
          <Select
            label="Select Doctor"
            placeholder="Choose a doctor"
            value={attendanceForm.doctor_id}
            onChange={(value) =>
              setAttendanceForm({ ...attendanceForm, doctor_id: value })
            }
            data={
              Array.isArray(doctors)
                ? doctors.map((doc) => ({
                    value: doc.id.toString(),
                    label: doc.doctor_name,
                  }))
                : []
            }
            required
          />
          <Select
            label="Status"
            placeholder="Select status"
            value={attendanceForm.status}
            onChange={(value) =>
              setAttendanceForm({ ...attendanceForm, status: value })
            }
            data={STATUS_OPTIONS}
            required
          />
          <Button
            variant="filled"
            onClick={onUpdateAttendance}
            loading={loading}
          >
            Update Status
          </Button>
        </Stack>
      </Card>

      {/* Current Status Display */}
      {Array.isArray(todaysSchedule) && todaysSchedule.length > 0 ? (
        <Card withBorder p="lg" mt="lg">
          <Title order={5} mb="md">
            Today's Doctor Status
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {todaysSchedule.map((schedule) => (
              <Card key={`status-${schedule.id}`} withBorder p="md">
                <Group position="apart">
                  <div>
                    <Text weight={700}>{schedule.doctor_name}</Text>
                    <Text size="sm" color="dimmed">
                      {schedule.specialization}
                    </Text>
                  </div>
                  <Badge color={getStatusColor(schedule.status)}>
                    {schedule.status}
                  </Badge>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Card>
      ) : null}
    </Stack>
  );
}
